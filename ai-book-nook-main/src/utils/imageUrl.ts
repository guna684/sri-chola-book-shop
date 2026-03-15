// Helper function to get the full image URL
export const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) {
        return '/images/placeholder-book.jpg';
    }

    // If it's already a full URL (starts with http:// or https://), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it's an uploaded image (starts with /uploads/), prepend API base URL
    if (imagePath.startsWith('/uploads/')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${apiUrl}${imagePath}`;
    }

    // For static images (like /images/...), return as is
    return imagePath;
};

// Build a prioritised list of image URLs to try in order
export const getImageFallbackChain = (
    image_url?: string,
    coverImage?: string,
    isbn?: string
): string[] => {
    const urls: string[] = [];

    if (image_url) urls.push(getImageUrl(image_url));
    if (coverImage && coverImage !== image_url) urls.push(getImageUrl(coverImage));

    // For missing images entirely, ensure we return at least a generic placeholder
    if (urls.length === 0) {
        urls.push('/images/placeholder-book.jpg');
    }

    if (isbn) {
        const cleanIsbn = isbn.replace(/[-\s]/g, '');
        urls.push(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`);
        urls.push(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`);
    }

    // Always fallback to standard placeholder if all external links fail
    urls.push('/images/placeholder-book.jpg');

    return [...new Set(urls)]; // Remove any accidental duplicates
};
