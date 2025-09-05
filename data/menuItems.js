const menuItems = [
  // 🥘 RICE DISHES
  {
    menuId: 1,
    name: "Jollof Rice",
    category: "Rice",
    imageUrl: "/menu/rice.jpeg",
    price: 6.5,
    description: "A classic West African favorite: spicy, flavorful jollof rice served with your choice of protein.",
    slug: "jollof-rice"
  },
  {
    menuId: 2,
    name: "Fried Rice",
    category: "Rice",
    imageUrl: "/menu/fried_rice.jpeg",
    price: 6.0,
    description: "Aromatic fried rice tossed with colorful vegetables and optional tender meat pieces.",
    slug: "fried-rice"
  },
  {
    menuId: 3,
    name: "Village Rice",
    category: "Rice",
    imageUrl: "/menu/native_rice.jpeg",
    price: 6.0,
    description: "Traditional Nigerian rice cooked with local spices for authentic, home-style flavors.",
    slug: "village-rice"
  },
  {
    menuId: 4,
    name: "Coconut Rice",
    category: "Rice",
    imageUrl: "/menu/coconut_rice.jpeg",
    price: 6.5,
    description: "Fragrant rice simmered in creamy coconut milk and seasoned with mild spices.",
    slug: "coconut-rice"
  },
  {
    menuId: 5,
    name: "Yam Porridge",
    category: "Rice",
    imageUrl: "/menu/yam_porridge.jpeg",
    price: 6.0,
    description: "Soft, tender yam cubes cooked in a rich, spicy palm oil sauce with fish or meat.",
    slug: "yam-porridge"
  },

  // 🫘 BEANS
  {
    menuId: 6,
    name: "Ewa Agoyin",
    category: "Beans",
    imageUrl: "/menu/beans.jpeg",
    price: 5.0,
    description: "Creamy mashed beans served with a spicy pepper sauce and fried plantains.",
    slug: "ewa-agoyin"
  },
  {
    menuId: 7,
    name: "Ewa Riro",
    category: "Beans",
    imageUrl: "/menu/stewed_beans.jpeg",
    price: 5.0,
    description: "Rich, stewed beans in tomato sauce, perfect with fried plantain or boiled yam.",
    slug: "ewa-riro"
  },
  {
    menuId: 8,
    name: "Moi Moi",
    category: "Beans",
    imageUrl: "/menu/moinmoin.jpeg",
    price: 3.0,
    description: "Delicate steamed bean pudding wrapped in fragrant leaves for a soft, savory bite.",
    slug: "moi-moi"
  },

  // 🍲 SOUPS & PEPPERSOUPS
  {
    menuId: 9,
    name: "Ikokore",
    category: "Soups",
    imageUrl: "/menu/ikokore.jpeg",
    price: 7.0,
    description: "A hearty yam and vegetable soup, rich in flavors from the Urhobo region.",
    slug: "ikokore"
  },
  {
    menuId: 10,
    name: "Assorted Peppersoup",
    category: "Soups",
    imageUrl: "/menu/assorted_meat.jpeg",
    price: 8.0,
    description: "Spicy, warming soup made with a mix of tender meats and aromatic spices.",
    slug: "assorted-peppersoup"
  },
  {
    menuId: 11,
    name: "Catfish Peppersoup",
    category: "Soups",
    imageUrl: "/menu/cat_fish.jpeg",
    price: 8.5,
    description: "Hot and flavorful soup with fresh, succulent catfish and spices.",
    slug: "catfish-peppersoup"
  },
  {
    menuId: 12,
    name: "Eforiro Assorted",
    category: "Soups",
    imageUrl: "/menu/efo_riro.jpeg",
    price: 7.5,
    description: "Lush vegetable soup cooked with a mix of meats for a rich, tasty experience.",
    slug: "eforiro-assorted"
  },
  {
    menuId: 13,
    name: "Egusi Assorted",
    category: "Soups",
    imageUrl: "/menu/egusi.jpeg",
    price: 8.0,
    description: "Creamy melon seed soup loaded with tender assorted meats.",
    slug: "egusi-assorted"
  },
  {
    menuId: 14,
    name: "Seafood Okro",
    category: "Soups",
    imageUrl: "/menu/okra_soup.jpeg",
    price: 9.0,
    description: "Okra soup cooked with fresh, flavorful seafood for a coastal delight.",
    slug: "seafood-okro"
  },
  {
    menuId: 15,
    name: "Edikalkong",
    category: "Soups",
    imageUrl: "/menu/edikaikong.jpeg",
    price: 7.5,
    description: "Rich vegetable soup with assorted meats, a Calabar specialty.",
    slug: "edikalkong"
  },
  {
    menuId: 16,
    name: "Bitter Leaf Soup",
    category: "Soups",
    imageUrl: "/menu/bitterleaf_soup.jpeg",
    price: 7.0,
    description: "Bittersweet soup with tender meats, perfect with your favorite swallow.",
    slug: "bitter-leaf-soup"
  },
  {
    menuId: 17,
    name: "Oha Soup Assorted",
    category: "Soups",
    imageUrl: "/menu/oha_soup.jpeg",
    price: 7.0,
    description: "Traditional Eastern Nigerian soup with assorted meats and fresh Oha leaves.",
    slug: "oha-soup-assorted"
  },
  {
    menuId: 18,
    name: "Abula Assorted Stew",
    category: "Soups",
    imageUrl: "/menu/amala.jpg",
    price: 7.5,
    description: "A hearty mix of different stews with tender assorted meats.",
    slug: "abula-assorted-stew"
  },
  {
    menuId: 19,
    name: "Ogbono Assorted",
    category: "Soups",
    imageUrl: "/menu/ogbono.jpeg",
    price: 7.0,
    description: "Draw soup made from wild mango seeds with beef, fish, and rich spices.",
    slug: "ogbono-assorted"
  },

  // 🍖 GRILL & SEAFOOD
  {
    menuId: 20,
    name: "Hake Fish",
    category: "Grill",
    imageUrl: "/menu/hack_fish.jpeg",
    price: 6.5,
    description: "Tender hake fish, fried or grilled to perfection.",
    slug: "hake-fish"
  },
  {
    menuId: 21,
    name: "Chicken",
    category: "Grill",
    imageUrl: "/menu/chickenn.jpeg",
    price: 5.0,
    description: "Juicy chicken grilled or fried with aromatic spices.",
    slug: "chicken"
  },
  {
    menuId: 22,
    name: "Drumsticks",
    category: "Grill",
    imageUrl: "/menu/drumsticks.jpeg",
    price: 4.5,
    description: "Spicy grilled chicken drumsticks, full of flavor.",
    slug: "drumsticks"
  },
  {
    menuId: 23,
    name: "Turkey",
    category: "Grill",
    imageUrl: "/menu/turkey.jpeg",
    price: 6.0,
    description: "Succulent grilled turkey pieces with rich seasoning.",
    slug: "turkey"
  },
  {
    menuId: 24,
    name: "Fried Mackerel Fish",
    category: "Grill",
    imageUrl: "/menu/grilled_mackerel.jpeg",
    price: 6.0,
    description: "Crispy fried mackerel, perfect for seafood lovers.",
    slug: "fried-mackerel-fish"
  },
  {
    menuId: 25,
    name: "Fried Beef",
    category: "Grill",
    imageUrl: "/menu/fried_beef.jpeg",
    price: 5.0,
    description: "Tender beef slices pan-fried with rich spices.",
    slug: "fried-beef"
  },
  {
    menuId: 26,
    name: "Peppered Snails",
    category: "Grill",
    imageUrl: "/menu/peppered_snail.jpeg",
    price: 7.0,
    description: "Spicy snails sautéed in rich pepper sauce.",
    slug: "peppered-snails"
  },
  {
    menuId: 27,
    name: "Peppered Prawns",
    category: "Grill",
    imageUrl: "/menu/prawn.jpeg",
    price: 8.0,
    description: "Juicy prawns cooked in a fiery, delicious sauce.",
    slug: "peppered-prawns"
  },
  {
    menuId: 28,
    name: "Whole Fish (Tilapia or Croaker with Plantain & Yam)",
    category: "Grill",
    imageUrl: "/menu/whole_fish_sides.jpeg",
    price: 9.0,
    description: "Grilled whole fish served with fried plantain and yam.",
    slug: "whole-fish-tilapia-croaker"
  },
  {
    menuId: 29,
    name: "Ayamasse",
    category: "Grill",
    imageUrl: "/menu/ayamasse.jpeg",
    price: 8.5,
    description: "Spicy stew with assorted fish and fresh vegetables.",
    slug: "ayamasse"
  },

  // 🥧 PASTRIES & SNACKS
  {
    menuId: 30,
    name: "Meat Pie",
    category: "Snacks",
    imageUrl: "/menu/meat_pie.jpeg",
    price: 2.5,
    description: "Golden flaky pastry filled with seasoned meat and vegetables.",
    slug: "meat-pie"
  },
  {
    menuId: 31,
    name: "Chicken Pie",
    category: "Snacks",
    imageUrl: "/menu/chicken_pie.jpeg",
    price: 2.5,
    description: "Buttery pastry filled with tender chicken pieces.",
    slug: "chicken-pie"
  },
  {
    menuId: 32,
    name: "Beef Roll",
    category: "Snacks",
    imageUrl: "/menu/beef_roll.jpeg",
    price: 2.5,
    description: "Crispy pastry roll filled with flavorful beef.",
    slug: "beef-roll"
  },
  {
    menuId: 33,
    name: "Fish Roll",
    category: "Snacks",
    imageUrl: "/menu/fish_roll.jpeg",
    price: 2.5,
    description: "Crispy roll stuffed with spiced fish.",
    slug: "fish-roll"
  },
  {
    menuId: 34,
    name: "Puff Puff",
    category: "Snacks",
    imageUrl: "/menu/puffpuff.jpeg",
    price: 2.0,
    description: "Light and fluffy deep-fried dough balls, mildly sweet.",
    slug: "puff-puff"
  },
  {
    menuId: 35,
    name: "Gizzdodo",
    category: "Snacks",
    imageUrl: "/menu/gizzdodo.jpeg",
    price: 4.0,
    description: "Savory combination of spiced gizzard and fried plantain.",
    slug: "gizzdodo"
  },

  // 🌾 SWALLOWS
  {
    menuId: 36,
    name: "Amala",
    category: "Swallow",
    imageUrl: "/menu/amala.jpeg",
    price: 4.0,
    description: "Soft, smooth yam flour swallow, perfect with any Nigerian soup.",
    slug: "amala"
  },
  {
    menuId: 37,
    name: "Pounded Yam",
    category: "Swallow",
    imageUrl: "/menu/pounded_yam.jpeg",
    price: 4.0,
    description: "Classic pounded yam, soft and stretchy, served with soups.",
    slug: "pounded-yam"
  },
  {
    menuId: 38,
    name: "FuFu",
    category: "Swallow",
    imageUrl: "/menu/fufu.jpeg",
    price: 4.0,
    description: "Smooth cassava or plantain-based swallow, great with any soup.",
    slug: "fufu"
  },
  {
    menuId: 39,
    name: "Eba",
    category: "Swallow",
    imageUrl: "/menu/eba.jpeg",
    price: 4.0,
    description: "Firm garri-based swallow, ideal with Nigerian soups.",
    slug: "eba"
  }
];

module.exports = menuItems;
