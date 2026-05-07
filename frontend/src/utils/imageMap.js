export const getFoodImage = (name) => {
  const imageMap = {
    'Caesar Salad': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80',
    'Tomato Soup': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
    'Grilled Salmon': 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=500&q=80',
    'Beef Steak': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&q=80',
    'Spaghetti Bolognese': 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=500&q=80',
    'Cheesecake': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
    'Chocolate Brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
    'Red Wine': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=500&q=80',
    'Orange Juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80',
    'Coffee': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80'
  };
  return imageMap[name] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
};
