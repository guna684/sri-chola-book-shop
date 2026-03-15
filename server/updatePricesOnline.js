import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config({ path: './server/.env' });
connectDB();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const updateBookPrices = async () => {
    try {
        const books = await Book.find({});
        console.log(`Found ${books.length} books to update.`);

        let updatedCount = 0;
        let noPriceFoundCount = 0;

        for (const book of books) {
            console.log(`Checking price for: ${book.title} by ${book.author}`);
            
            try {
                // Query Google Books API
                const query = encodeURIComponent(`${book.title} ${book.author}`);
                const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`);
                
                let foundPrice = null;
                
                if (response.data.items && response.data.items.length > 0) {
                    for (const item of response.data.items) {
                        const saleInfo = item.saleInfo;
                        
                        // Check if it's for sale and has a list price
                        if (saleInfo && saleInfo.saleability === 'FOR_SALE' && saleInfo.listPrice) {
                            const amount = saleInfo.listPrice.amount;
                            const currencyCode = saleInfo.listPrice.currencyCode;
                            
                            if (currencyCode === 'INR') {
                                foundPrice = Math.round(amount);
                            } else if (currencyCode === 'USD') {
                                foundPrice = Math.round(amount * 83); // Approx conversion 
                            } else if (currencyCode === 'GBP') {
                                foundPrice = Math.round(amount * 105);
                            } else if (currencyCode === 'EUR') {
                                foundPrice = Math.round(amount * 90);
                            } else {
                                foundPrice = Math.round(amount * 80);
                            }
                            break;
                        }
                    }
                }
                
                if (foundPrice) {
                    let retailPrice = foundPrice;
                    const remainder = foundPrice % 10;
                    if (remainder !== 9) {
                        // round to nearest X99 or X49
                        const base10 = Math.floor(foundPrice / 10) * 10;
                        retailPrice = base10 + 9;
                    }
                    
                    if (retailPrice < 99) retailPrice = 99;
                    if (retailPrice > 3999) retailPrice = 3999;
                    
                    book.price = retailPrice;
                    book.originalPrice = retailPrice + 100 + Math.floor(Math.random() * 200);
                    
                    await book.save();
                    updatedCount++;
                    console.log(`✅ Updated ${book.title} to ₹${retailPrice}`);
                } else {
                    console.log(`🤷 No price found in API for ${book.title}. Keeping existing.`);
                    noPriceFoundCount++;
                }
                
                await sleep(1500); 
                
            } catch(err) {
                 console.error(`Error querying ${book.title}: ${err.message}`);
                 await sleep(2000); 
            }
        }

        console.log('--- Price Update Summary ---');
        console.log(`Successfully updated prices for ${updatedCount} books based on online data.`);
        console.log(`Could not find online prices for ${noPriceFoundCount} books.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating prices:', error);
        process.exit(1);
    }
};

updateBookPrices();
