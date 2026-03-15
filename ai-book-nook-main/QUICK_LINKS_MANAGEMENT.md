# Quick Links & Categories Management

## 🎯 **Overview**
Admin management system for dynamically editing navigation quick links and book categories without code changes.

## 🌐 **Access**
- **URL**: `http://localhost:8080/admin/quick-links`
- **Navigation**: Admin Dashboard → Quick Links & Categories
- **Permissions**: Admin only

## 📋 **Features**

### **Quick Links Management**
- ✅ **Add New Links**: Create new navigation links
- ✅ **Edit Existing**: Modify title, path, and icon
- ✅ **Reorder**: Drag-and-drop or arrow buttons to change order
- ✅ **Toggle Active/Inactive**: Enable/disable links without deleting
- ✅ **Delete**: Remove unwanted links
- ✅ **Real-time Updates**: Changes reflect immediately in navigation

### **Categories Management**
- ✅ **Add New Categories**: Create new book categories
- ✅ **Edit Existing**: Modify name and slug
- ✅ **Reorder**: Change category display order
- ✅ **Toggle Active/Inactive**: Show/hide categories
- ✅ **Delete**: Remove categories
- ✅ **URL Generation**: Automatic slug-based URLs

## 🔧 **Technical Implementation**

### **Backend API**
- **GET** `/api/admin/quick-links` - Fetch all quick links
- **POST** `/api/admin/quick-links` - Add new quick link
- **PUT** `/api/admin/quick-links/:id` - Update quick link
- **DELETE** `/api/admin/quick-links/:id` - Delete quick link
- **GET** `/api/admin/categories` - Fetch all categories
- **POST** `/api/admin/categories` - Add new category
- **PUT** `/api/admin/categories/:id` - Update category
- **DELETE** `/api/admin/categories/:id` - Delete category

### **Frontend Components**
- **Tabs Interface**: Separate tabs for links and categories
- **Inline Editing**: Click-to-edit functionality
- **Drag Controls**: Up/down arrows for reordering
- **Status Toggles**: Switch components for active/inactive
- **Real-time Updates**: Instant UI refresh after changes

### **Data Structure**
```javascript
// Quick Links
{
  id: number,
  title: string,
  path: string,
  icon: string,
  order: number,
  active: boolean
}

// Categories
{
  id: number,
  name: string,
  slug: string,
  order: number,
  active: boolean
}
```

## 🎨 **UI Features**

### **Quick Links Tab**
- **Add Section**: Input fields for title, path, and icon
- **List View**: All links with edit controls
- **Status Badges**: Visual active/inactive indicators
- **Action Buttons**: Edit, save, cancel, delete
- **Reorder Controls**: Up/down arrows

### **Categories Tab**
- **Add Section**: Name and slug inputs
- **List View**: All categories with controls
- **URL Preview**: Shows generated category URL
- **Same Controls**: Edit, reorder, delete functionality

## 📱 **User Experience**

### **Admin Workflow**
1. **Navigate**: Admin Dashboard → Quick Links & Categories
2. **Choose Tab**: Quick Links or Categories
3. **Add/Edit**: Use inline editing or add new items
4. **Reorder**: Use arrow buttons to arrange
5. **Toggle**: Enable/disable items as needed
6. **Save**: Changes auto-save with confirmation

### **Visual Feedback**
- ✅ **Toast Notifications**: Success/error messages
- ✅ **Loading States**: Spinner during operations
- ✅ **Confirmations**: Delete confirmations
- ✅ **Status Indicators**: Active/inactive badges

## 🔐 **Security**
- **Admin Authentication**: Protected routes
- **Token Validation**: JWT token required
- **Permission Checks**: Admin-only access
- **Input Validation**: Required fields validation

## 📊 **Current Data**

### **Default Quick Links**
1. About → `/about`
2. Contact → `/contact`
3. FAQs → `/faqs`
4. Shipping → `/shipping`
5. Returns → `/returns`
6. Privacy → `/privacy`

### **Default Categories**
1. Fiction → `fiction`
2. Non-Fiction → `non-fiction`
3. Mystery → `mystery`
4. Romance → `romance`
5. Sci-Fi → `sci-fi`
6. Self-Help → `self-help`

## 🚀 **Usage Instructions**

### **Adding New Quick Link**
1. Go to Quick Links tab
2. Fill in title, path, and icon
3. Click "Add Link"
4. Link appears in list immediately

### **Reordering Items**
1. Use up/down arrows next to each item
2. Order updates automatically
3. Changes reflect in navigation

### **Managing Status**
1. Click edit button for any item
2. Toggle active/inactive switch
3. Click save to apply changes

---
*Feature Added: March 2026*
*Sri Chola Books Admin Panel*
