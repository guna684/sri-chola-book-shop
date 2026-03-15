import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, BookOpen } from 'lucide-react';
import { Book } from '@/types/book';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '@/utils/localization';
import { getImageFallbackChain } from '@/utils/imageUrl';

interface BookCardProps {
  book: Book;
  index?: number;
}

const BookCard = ({ book, index = 0 }: BookCardProps) => {
  const { i18n } = useTranslation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Build the ordered list of image URLs to try
  const fallbackChain = getImageFallbackChain(book.image_url, book.coverImage, book.isbn);
  const [imgIndex, setImgIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  const handleImgError = () => {
    const next = imgIndex + 1;
    if (next < fallbackChain.length) {
      setImgIndex(next);
    } else {
      setImgFailed(true);
    }
  };

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {book.bestseller && (
          <Badge className="bg-accent text-accent-foreground">
            Bestseller
          </Badge>
        )}
        {discount > 0 && (
          <Badge className="bg-primary text-primary-foreground">
            {discount}% OFF
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isInWishlist(book.id)) {
            removeFromWishlist(book.id);
          } else {
            addToWishlist(book);
          }
        }}
        className={`absolute top-3 right-3 z-10 h-8 w-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isInWishlist(book.id)
          ? 'bg-red-50 text-red-500 opacity-100'
          : 'bg-card/80 opacity-0 group-hover:opacity-100 hover:bg-card hover:text-accent'
          }`}
      >
        <Heart className={`h-4 w-4 ${isInWishlist(book.id) ? 'fill-current' : ''}`} />
      </button>

      {/* Cover Image */}
      <Link to={`/book/${book.id}`} className="block relative overflow-hidden aspect-[3/4] bg-muted">
        {imgFailed ? (
          /* All sources exhausted — show a nice placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground gap-3 p-4">
            <div className="bg-muted-foreground/10 rounded-full p-4">
              <BookOpen className="h-10 w-10 opacity-40" />
            </div>
            <span className="text-xs font-medium opacity-50 text-center line-clamp-2">
              {getLocalized(book, 'title', i18n.language)}
            </span>
          </div>
        ) : (
          <img
            key={imgIndex}
            src={fallbackChain[imgIndex]}
            alt={getLocalized(book, 'title', i18n.language)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={handleImgError}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {getLocalized(book, 'category', i18n.language)}
          </span>
        </div>

        <Link to={`/book/${book.id}`}>
          <h3 className="font-serif font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
            {getLocalized(book, 'title', i18n.language)} | Sri Chola Book Shop
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mt-1">
          by {getLocalized(book, 'author', i18n.language)}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm font-medium">{book.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({book.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              ₹{book.price}
            </span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{book.originalPrice}
              </span>
            )}
          </div>
          <Button
            variant="gold"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addToCart(book);
            }}
            className="gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
