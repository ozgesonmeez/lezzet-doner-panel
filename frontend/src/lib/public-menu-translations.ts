// English display copy for the public menu. IDs match the Turkish API records.
export const categoryEnglish: Readonly<Record<number, string>> = {
  1: "Chicken Döner", 2: "Beef Döner", 3: "Combo Meals",
  4: "Sides", 5: "Drinks", 7: "Sauces",
};

export const categoryDescriptionEnglish: Readonly<Record<number, string>> = {
  1: "Our chicken döner selections",
  2: "Our beef döner selections",
  3: "Our value combo meals",
  4: "Sides to go with your meal",
  5: "Our cold drinks",
};

const chickenToppings = "With lettuce, pickles, sauce and mayonnaise.";
const beefToppings = "With onions and tomatoes.";
const comboSides = "with fries and a canned drink.";
const softDrink = "Cold carbonated soft drink.";

export const productEnglish: Readonly<Record<number, readonly [name: string, description: string]>> = {
  1: ["Full Chicken Döner Sandwich", chickenToppings],
  2: ["Half Chicken Döner Sandwich", chickenToppings],
  3: ["Half Beef Döner Sandwich", beefToppings],
  6: ["Hatay Wrap", chickenToppings],
  7: ["XL Double Hatay Wrap", chickenToppings],
  8: ["Zurna Wrap", chickenToppings],
  9: ["Chicken Döner over Rice", "Chicken döner served over rice."],
  10: ["Chicken Döner Plate", "A plate of chicken döner."],
  12: ["Full Beef Döner Sandwich", beefToppings],
  13: ["Beef Döner Wrap", beefToppings],
  14: ["Beef Döner over Rice", "Sliced beef döner served over rice."],
  15: ["Beef Döner Plate", "A plate of sliced beef döner."],
  16: ["Full Chicken Döner Combo", `A full chicken döner sandwich ${comboSides}`],
  17: ["Half Chicken Döner Combo", `A half chicken döner sandwich ${comboSides}`],
  18: ["Hatay Wrap Combo", `A Hatay wrap ${comboSides}`],
  19: ["XL Double Hatay Combo", `An XL double Hatay wrap ${comboSides}`],
  20: ["Zurna Wrap Combo", `A Zurna wrap ${comboSides}`],
  21: ["Beef Döner Wrap Combo", `A beef döner wrap ${comboSides}`],
  22: ["Atom Fries Sandwich", "Fries served in bread."],
  23: ["Fries", "Crispy fries."],
  24: ["Ayran (175 ml)", "175 ml of ayran."],
  25: ["Ayran (300 ml)", "300 ml of ayran."],
  26: ["Cola", softDrink],
  27: ["Fanta", softDrink],
  28: ["Sprite", softDrink],
  29: ["Fuse Tea", "Peach or mango and pineapple."],
  30: ["Şalgam", "Spicy or mild."],
  31: ["Plain Mineral Water", "Plain sparkling mineral water."],
  32: ["Flavored Mineral Water", "Lemon-flavored mineral water."],
  33: ["Water", "Drinking water."],
  34: ["Tea", "Hot tea."],
  35: ["Turkish Coffee", "Unsweetened, medium-sweet or sweet."],
  36: ["Full Beef Döner Combo", `A full beef döner sandwich ${comboSides}`],
};

export const variantEnglish: Readonly<Record<string, string>> = {
  "Klasik Patates Kızartması": "Classic Fries",
  "Özel Baharatlı Patates Kızartması": "Specially Seasoned Fries",
};
