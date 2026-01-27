export interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  image: any
  category: string
  rating: number
  sides?: { name: string; included: boolean }[]
  drinks?: { name: string; price: number; included: boolean }[]
  extras?: { name: string; price: number }[]
  optionalIngredients?: { name: string; default: boolean }[]
}

export const foodItems: FoodItem[] = [
  // Starters
  {
    id: '1',
    name: 'Honey Glazed Chicken Medallions',
    description: 'Crispy chicken medallions glazed with honey mustard.',
    price: 89.0,
    image: require('../assets/images/starters/honey glazed chicken medallions.jpg'),
    category: 'starters',
    rating: 5,
    sides: [
      { name: 'Chips', included: true },
      { name: 'Salad', included: true },
      { name: 'Rice', included: true },
    ],
    drinks: [
      { name: 'Coke', price: 15, included: false },
      { name: 'Sprite', price: 15, included: false },
      { name: 'Water', price: 10, included: false },
    ],
    extras: [
      { name: 'Extra Sauce', price: 5 },
      { name: 'Extra Chips', price: 20 },
    ],
  },
  {
    id: '4',
    name: 'Crispy Mozzarella Sticks',
    description: 'Golden-fried mozzarella sticks served with a rich tomato dip.',
    price: 69.0,
    image: require('../assets/images/starters/crispy mozzarella sticks.jpg'),
    category: 'starters',
    rating: 5,
    sides: [
      { name: 'Tomato Dip', included: true },
    ],
    drinks: [
      { name: 'Coke', price: 15, included: false },
    ],
    extras: [
      { name: 'Extra Dip', price: 8 },
    ],
  },
  {
    id: '5',
    name: 'Garlic Herb Bruschetta',
    description: 'Toasted bread with fresh tomato, basil, and olive oil.',
    price: 59.0,
    image: require('../assets/images/starters/garlic herb bruschetta.jpg'),
    category: 'starters',
    rating: 5,
    sides: [
      { name: 'Olive Oil', included: true },
    ],
    extras: [
      { name: 'Extra Basil', price: 5 },
    ],
  },
  {
    id: '6',
    name: 'Classic Beef Slider',
    description: 'Mini beef patty with melted cheddar on a soft brioche bun.',
    price: 55.0,
    image: require('../assets/images/starters/classic beef slider.jpg'),
    category: 'starters',
    rating: 5,
    sides: [
      { name: 'Chips', included: true },
    ],
    drinks: [
      { name: 'Coke', price: 15, included: false },
    ],
    extras: [
      { name: 'Extra Cheese', price: 8 },
    ],
  },
  // Mains
  {
    id: '3',
    name: 'The Trio Harvest Bowl',
    description: 'Herb-crusted grilled chicken breast with roasted garlic potatoes and penne pasta in a velvety cream sauce.',
    price: 165.0,
    image: require('../assets/images/mains/The Trio Harvest Bowl.jpg'),
    category: 'mains',
    rating: 5,
    sides: [
      { name: 'Roasted Garlic Potatoes', included: true },
      { name: 'Penne Pasta', included: true },
    ],
    drinks: [
      { name: 'Wine', price: 45, included: false },
      { name: 'Water', price: 10, included: false },
    ],
    extras: [
      { name: 'Extra Chicken', price: 35 },
      { name: 'Extra Sauce', price: 10 },
    ],
  },
  {
    id: '14',
    name: 'The Mediterranean Grill Wrap',
    description: 'Flame-grilled chicken strips wrapped in toasted flatbread with herb-infused yogurt sauce. Served with garden salad and lemon.',
    price: 130.0,
    image: require('../assets/images/mains/The Mediterranean Grill Wrap.jpg'),
    category: 'mains',
    rating: 5,
    sides: [
      { name: 'Garden Salad', included: true },
      { name: 'Lemon', included: true },
    ],
    drinks: [
      { name: 'Fresh Juice', price: 25, included: false },
      { name: 'Water', price: 10, included: false },
    ],
    extras: [
      { name: 'Extra Chicken', price: 30 },
      { name: 'Extra Sauce', price: 8 },
    ],
  },
  {
    id: '15',
    name: 'The Karoo & Coast Platter',
    description: 'Herb-crusted lamb chops and juicy grilled prawns served over pepper-infused rice. Garnished with fresh rosemary and parsley.',
    price: 285.0,
    image: require('../assets/images/mains/The Karoo & Coast Platter.jpg'),
    category: 'mains',
    rating: 5,
    sides: [
      { name: 'Pepper-infused Rice', included: true },
      { name: 'Fresh Rosemary', included: true },
    ],
    drinks: [
      { name: 'Wine', price: 45, included: false },
      { name: 'Water', price: 10, included: false },
    ],
    extras: [
      { name: 'Extra Prawns', price: 50 },
      { name: 'Extra Lamb Chops', price: 60 },
    ],
  },
  {
    id: '16',
    name: 'The Ultimate Layered Lasagna',
    description: 'Layers of slow-simmered beef ragu, silky béchamel, and melted mozzarella. Baked until perfectly golden and bubbling.',
    price: 155.0,
    image: require('../assets/images/mains/The Ultimate Layered Lasagna.jpg'),
    category: 'mains',
    rating: 5,
    sides: [
      { name: 'Garlic Bread', included: true },
      { name: 'Side Salad', included: true },
    ],
    drinks: [
      { name: 'Wine', price: 45, included: false },
      { name: 'Coke', price: 15, included: false },
    ],
    extras: [
      { name: 'Extra Cheese', price: 15 },
      { name: 'Extra Garlic Bread', price: 12 },
    ],
  },
  {
    id: '17',
    name: "The Butcher's Block Platter",
    description: 'Flame-grilled sausages, sticky riblets, and roasted pork. Served with crispy fries and our signature spicy dipping sauce.',
    price: 210.0,
    image: require("../assets/images/mains/The Butcher's Block Platter.jpg"),
    category: 'mains',
    rating: 5,
    sides: [
      { name: 'Crispy Fries', included: true },
      { name: 'Spicy Dipping Sauce', included: true },
    ],
    drinks: [
      { name: 'Beer', price: 35, included: false },
      { name: 'Coke', price: 15, included: false },
    ],
    extras: [
      { name: 'Extra Sausages', price: 25 },
      { name: 'Extra Riblets', price: 30 },
    ],
  },
  // Burgers
  {
    id: '18',
    name: 'Tripple Stack Cheddar Burger',
    description: 'Three juicy prime beef patties with melted aged cheddar, crispy bacon, and spicy jalapeños. Served on a toasted sesame bun with golden fries.',
    price: 210.0,
    image: require('../assets/images/burgers/Tripple Stack Cheddar Burger.jpg'),
    category: 'burgers',
    rating: 5,
    sides: [
      { name: 'Golden Fries', included: true },
    ],
    drinks: [
      { name: 'Coke', price: 15, included: false },
      { name: 'Milkshake', price: 25, included: false },
    ],
    extras: [
      { name: 'Extra Cheese', price: 10 },
      { name: 'Extra Bacon', price: 15 },
    ],
    optionalIngredients: [
      { name: 'Jalapeños', default: true },
      { name: 'Lettuce', default: true },
      { name: 'Tomato', default: true },
    ],
  },
  {
    id: '19',
    name: 'The Double-Up Deluxe',
    description: 'Two prime seared beef patties topped with double melted cheddar on a toasted brioche bun. Served with thin-cut crispy fries.',
    price: 135.0,
    image: require('../assets/images/burgers/The Double-Up Deluxe.jpg'),
    category: 'burgers',
    rating: 5,
    sides: [
      { name: 'Thin-cut Crispy Fries', included: true },
    ],
    drinks: [
      { name: 'Coke', price: 15, included: false },
      { name: 'Milkshake', price: 25, included: false },
    ],
    extras: [
      { name: 'Extra Cheese', price: 10 },
      { name: 'Extra Patty', price: 25 },
    ],
    optionalIngredients: [
      { name: 'Lettuce', default: true },
      { name: 'Tomato', default: true },
      { name: 'Onion', default: true },
    ],
  },
  {
    id: '20',
    name: 'The Rustic Rocket Burger',
    description: 'Flame-grilled beef patty with melted sharp cheddar, fresh wild rocket, and red onion. Served on a toasted sesame brioche bun with golden fries.',
    price: 115.0,
    image: require('../assets/images/burgers/The Rustic Rocket Burger.jpg'),
    category: 'burgers',
    rating: 5,
    sides: [
      { name: 'Crispy Golden Fries', included: true },
      { name: 'House-made Relish', included: true },
    ],
    drinks: [
      { name: 'Coke', price: 15, included: false },
      { name: 'Water', price: 10, included: false },
    ],
    extras: [
      { name: 'Extra Cheese', price: 10 },
      { name: 'Extra Rocket', price: 5 },
    ],
    optionalIngredients: [
      { name: 'Rocket', default: true },
      { name: 'Red Onion', default: true },
    ],
  },
  {
    id: '21',
    name: 'The Smokehouse Brioche Deluxe',
    description: 'Flame-grilled beef patty topped with smoky glazed bacon and melted sharp cheddar. Served on a butter-toasted brioche bun with golden fries.',
    price: 165.0,
    image: require('../assets/images/burgers/The Smokehouse Brioche Deluxe.jpg'),
    category: 'burgers',
    rating: 5,
    sides: [
      { name: 'Golden Fries', included: true },
    ],
    drinks: [
      { name: 'Coke', price: 15, included: false },
      { name: 'Milkshake', price: 25, included: false },
    ],
    extras: [
      { name: 'Extra Cheese', price: 10 },
      { name: 'Extra Bacon', price: 15 },
    ],
    optionalIngredients: [
      { name: 'Lettuce', default: true },
      { name: 'Tomato', default: true },
    ],
  },
  {
    id: '22',
    name: 'The Toasted Sesame Chicken Deluxe',
    description: 'A lighter take on the classic burger. Features a succulent flame-grilled chicken breast topped with melted cheddar, fresh tomato, and crisp lettuce. Served on a signature black-and-white sesame brioche bun with a side of golden fries.',
    price: 125.0,
    image: require('../assets/images/burgers/The Toasted Sesame Chicken Deluxe.jpg'),
    category: 'burgers',
    rating: 5,
    sides: [
      { name: 'Golden Fries', included: true },
    ],
    drinks: [
      { name: 'Coke', price: 15, included: false },
      { name: 'Water', price: 10, included: false },
    ],
    extras: [
      { name: 'Extra Cheese', price: 10 },
      { name: 'Extra Chicken', price: 20 },
    ],
    optionalIngredients: [
      { name: 'Lettuce', default: true },
      { name: 'Tomato', default: true },
    ],
  },
  // Desserts
  {
    id: '23',
    name: 'The Red Velvet Dream Slice',
    description: 'Rich chocolate cookie base topped with moist red velvet cake and silky cream cheese frosting. Finished with berry glaze and fresh strawberries.',
    price: 85.0,
    image: require('../assets/images/desert/The Red Velvet Dream Slice.jpg'),
    category: 'desserts',
    rating: 5,
    extras: [
      { name: 'Extra Strawberries', price: 10 },
      { name: 'Extra Cream', price: 8 },
    ],
  },
  {
    id: '24',
    name: 'The Tuxedo Mousse Square',
    description: 'Alternating tiers of rich dark cocoa sponge and velvety white chocolate mousse. Topped with silk ganache, fresh raspberries, and dark chocolate drizzle.',
    price: 78.0,
    image: require('../assets/images/desert/The Tuxedo Mousse Square.jpg'),
    category: 'desserts',
    rating: 5,
    extras: [
      { name: 'Extra Raspberries', price: 10 },
      { name: 'Extra Chocolate Drizzle', price: 5 },
    ],
  },
  {
    id: '25',
    name: 'The Retro Royale Split',
    description: 'Freshly sliced banana with premium vanilla, chocolate, and strawberry ice cream. Topped with chocolate fudge, roasted nuts, whipped cream, and maraschino cherries.',
    price: 80.0,
    image: require('../assets/images/desert/The Retro Royale Split.jpg'),
    category: 'desserts',
    rating: 5,
    extras: [
      { name: 'Extra Ice Cream Scoop', price: 15 },
      { name: 'Extra Nuts', price: 8 },
    ],
  },
  {
    id: '26',
    name: 'The Strawberry Swirl Super-Shake',
    description: 'Thick-blend vanilla milkshake marbled with house-made strawberry reduction. Served over fresh berry slices with whipped cream and a sun-ripened strawberry.',
    price: 70.0,
    image: require('../assets/images/desert/The Strawberry Swirl Super-Shake.jpg'),
    category: 'desserts',
    rating: 5,
    extras: [
      { name: 'Extra Whipped Cream', price: 5 },
      { name: 'Extra Strawberries', price: 8 },
    ],
  },
  {
    id: '27',
    name: 'The Berry-Banana Cloud Stack',
    description: 'Tall stack of buttermilk pancakes layered with fresh banana slices and seasonal berries. Topped with whipped cream and a generous drizzle of pure maple syrup.',
    price: 105.0,
    image: require('../assets/images/desert/The Berry-Banana Cloud Stack.jpg'),
    category: 'desserts',
    rating: 5,
    extras: [
      { name: 'Extra Pancakes', price: 20 },
      { name: 'Extra Maple Syrup', price: 5 },
    ],
  },
  // Beverages
  {
    id: '28',
    name: 'The Botanical Infusion Trio',
    description: 'House-made botanical infusions crafted with cold-pressed fruits, garden-fresh mint, and premium tea blends. Choose from Zesty Citrus, Sunset Peach, or Forest Berry.',
    price: 58.0,
    image: require('../assets/images/beverages/The Botanical Infusion Trio.jpg'),
    category: 'beverages',
    rating: 5,
  },
  {
    id: '29',
    name: 'The Ice-Cold Soda Range',
    description: 'Premium sparkling sodas from zesty lemon-lime and classic cola to bold fruit infusions. Every can served at sub-zero temperatures for maximum refreshment.',
    price: 20.0,
    image: require('../assets/images/beverages/The Ice-Cold Soda Range.jpg'),
    category: 'beverages',
    rating: 5,
  },
  {
    id: '30',
    name: 'The Artisan Pour-Over Latte',
    description: 'Signature house blend espresso combined with silky, micro-foamed milk. Finished with hand-poured latte art - a warm, aromatic classic for any time of day.',
    price: 32.0,
    image: require('../assets/images/beverages/The Artisan Pour-Over Latte.jpg'),
    category: 'beverages',
    rating: 5,
  },
  {
    id: '31',
    name: 'The Red Bull Energy Range',
    description: 'Choose from classic Original, Sugarfree, or crisp fruit Editions including Blueberry, Watermelon, and Lime. Perfectly chilled for an instant refresh.',
    price: 28.0,
    image: require('../assets/images/beverages/The Red Bull Energy Range.jpg'),
    category: 'beverages',
    rating: 5,
  },
  {
    id: '32',
    name: 'The Garden Glow Smoothie Range',
    description: 'Vibrant, cold-blended smoothies made with 100% real fruit and leafy greens. Thick and creamy blends packed with vitamins and topped with seasonal berries.',
    price: 65.0,
    image: require('../assets/images/beverages/The Garden Glow Smoothie Range.jpg'),
    category: 'beverages',
    rating: 5,
  },
  // Alcohol
  {
    id: '33',
    name: 'The Ice-Cold Mug',
    description: 'Refreshing golden beer served in a heavily chilled glass mug. Crisp, clean, and topped with a perfect frothy head, served at sub-zero temperatures.',
    price: 45.0,
    image: require('../assets/images/alcohol/The Ice-Cold Mug.jpg'),
    category: 'alcohol',
    rating: 5,
  },
  {
    id: '34',
    name: 'House Wine Selection',
    description: 'Curated selection of our finest reds, whites, and rosés, poured to order. From crisp and light to bold and full-bodied, explore premium labels by the glass.',
    price: 55.0,
    image: require('../assets/images/alcohol/House Wine Selection.jpg'),
    category: 'alcohol',
    rating: 5,
  },
  {
    id: '35',
    name: 'The Whiskey Collection',
    description: 'Handpicked selection of premium whiskies from Scottish Highlands to American Bourbon. Served neat, on the rocks, or with a splash of spring water.',
    price: 75.0,
    image: require('../assets/images/alcohol/The Whiskey Collection.jpg'),
    category: 'alcohol',
    rating: 5,
  },
  {
    id: '36',
    name: 'The Crystal Vodka Selection',
    description: 'Pure, crisp, and triple-distilled vodka selection from classic grain spirits to premium small-batch labels. Enjoy ice-cold as a shot or with your favorite mixer.',
    price: 85.0,
    image: require('../assets/images/alcohol/The Crystal Vodka Selection.jpg'),
    category: 'alcohol',
    rating: 5,
  },
  {
    id: '37',
    name: 'The Mixology Collection',
    description: 'Artfully crafted cocktails blending premium spirits with fresh botanicals, house-made syrups, and exotic fruit infusions. From timeless classics to signature creations.',
    price: 110.0,
    image: require('../assets/images/alcohol/The Mixology Collection.jpg'),
    category: 'alcohol',
    rating: 5,
  },
]

export const getItemsByCategory = (category: string) => {
  return foodItems.filter((item) => item.category === category)
}
