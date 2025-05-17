import React, { useState } from "react";
import { useParams } from "react-router-dom"; // if you use react-router for product id param
import { useCart } from "../../contexts/CartContext"; // adjust path as needed
import "./ProductDetails.css";


// Simple StarRating component
// Simple StarRating component
function StarRating({ rating, editable = false, onChange }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  const getClassName = (star) => {
    if (editable) {
      if (hover >= star) return "pd-star filled editable";
      if (!hover && rating >= star) return "pd-star filled editable";
      return "pd-star editable";
    }
    return rating >= star ? "pd-star filled" : "pd-star";
  };

  return (
    <div className="pd-star-rating">
      {stars.map((star) => (
        <span
          key={star}
          className={getClassName(star)}
          onMouseEnter={() => editable && setHover(star)}
          onMouseLeave={() => editable && setHover(0)}
          onClick={() => editable && onChange(star)}
          role={editable ? "button" : undefined}
          aria-label={editable ? `Set rating to ${star}` : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductDetails() {
  // Assuming you get product ID from route params
  const { id } = useParams();
  const productId = parseInt(id);

  // Always call hooks at the top level!
  const { addToCart } = useCart();
// Dummy products list (replace with your real data source or API)
const allProducts = [
  {
    id: 1,
    name: "Modern Sofa",
    price: 1200,
    rating: 4.8,
    image:
     /* "https://www.cuckooland.com/blog/wp-content/uploads/2022/04/Stratus-Eco-Friendly-4-Seater-Sofa-in-Eco-Green-Velvet.jpg"*/
      "https://i5.walmartimages.com/asr/823f1e50-b827-4cfd-9f30-3897cb5fcfad.bf223222239f8933b96feb796a5013e6.jpeg",
    category: "Living Room",
  },
  {
    id: 2,
    name: "Coffee Table",
    price: 230,
    rating: 4.5,
    image:
      "https://th.bing.com/th/id/OIP.UM0PypRIkEMCmKXdy9JrlgHaHa?cb=iwp2&rs=1&pid=ImgDetMain",
    category: "Living Room",
  },
  {
    id: 3,
    name: "TV Stand",
    price: 300,
    rating: 4.4,
    image:
      "https://cdn.shopify.com/s/files/1/2781/6416/products/meble-furniture-entertainment-centers-tv-stands-eva-77-tv-stand-21320846344354_1400x.png?v=1669489701",
    category: "Living Room",
  },
  {
    id: 4,
    name: "Recliner Chair",
    price: 550,
    rating: 4.7,
    image:
      "https://images.woodenstreet.de/image/cache/data/Duroflex/recliner/avalon-fabric-1-seater-motorized-recliners/light+brown/1-810x702.jpg",
    category: "Living Room",
  },
  {
    id: 5,
    name: "Floor Lamp",
    price: 90,
    rating: 4.2,
    image:
      "https://m.media-amazon.com/images/I/71ywyoWF+wL._AC_SL1500_.jpg",
    category: "Living Room",
  },

  // Bedroom (5 products)
  {
    id: 6,
    name: "Wooden Bed Frame",
    price: 450,
    rating: 4.6,
    image:
      "https://th.bing.com/th/id/R.226ff0411e4d311dcb81c9a9d460e49b?rik=B79nPS5LuWqrvA&riu=http%3a%2f%2fmf-direct-ebay.co.uk%2febay%2ffrenchdoublebed%2ffrench_bed_4.jpg&ehk=7biORvH6IsC8qcKaXp8nnBI9GnRieAFE%2bgzBrf3J39I%3d&risl=&pid=ImgRaw&r=0",
    category: "Bedroom",
  },
  {
    id: 7,
    name: "Nightstand with Drawer",
    price: 120,
    rating: 4.4,
    image:
      "https://assets.wfcdn.com/im/44579345/compr-r85/2487/248773095/aleyana-2-drawer-solid-wood-nightstand.jpg",
    category: "Bedroom",
  },
  {
    id: 8,
    name: "Wardrobe with Sliding Doors",
    price: 800,
    rating: 4.7,
    image:
      "https://en.idei.club/uploads/posts/2023-08/1691082953_en-idei-club-p-drawing-room-wall-almirah-design-dizain-vk-36.jpg",
    category: "Bedroom",
  },
  {
    id: 9,
    name: "Dresser with Mirror",
    price: 350,
    rating: 4.5,
    image:
      "https://images.furnituredealer.net/img/products/lifestyle/color/5219a%20by%20lifestyle_c5219a-045%2B050-7dxx-b0.jpg",
    category: "Bedroom",
  },
  {
    id: 10,
    name: "Bookshelf",
    price: 200,
    rating: 4.3,
    image:
      "https://i5.walmartimages.com/asr/71997cfc-e436-463a-9cc3-cf8eda220c29.3bed6922e54d0b087c4c52d8cbe49408.jpeg",
    category: "Bedroom",
  },

  // Dining Room (5 products)
  {
    id: 11,
    name: "Dining Table Set",
    price: 950,
    rating: 4.7,
    image:
      "https://furniturefair.net/cdn/shop/files/lifestyle_brown_-web_2000x.jpg?v=1720452463",
    category: "Dining Room",
  },
  {
    id: 12,
    name: "Wooden Dining Chairs",
    price: 300,
    rating: 4.4,
    image:
      "https://th.bing.com/th/id/OIP.7GPmjNXlx0bZD6528iFJBAHaHa?cb=iwp2&rs=1&pid=ImgDetMain",
    category: "Dining Room",
  },
  {
    id: 13,
    name: "Buffet Cabinet",
    price: 450,
    rating: 4.5,
    image:
      "https://th.bing.com/th/id/R.a2accce7d8969bb8819b49cc9295e798?rik=hhmL7r6vv0WoQQ&pid=ImgRaw&r=0",
    category: "Dining Room",
  },
  {
    id: 14,
    name: "Bar Stools",
    price: 250,
    rating: 4.3,
    image:
      "https://foter.com/photos/401/stratton-28-bar-stool.jpg",
    category: "Dining Room",
  },
  {
    id: 15,
    name: "Sideboard",
    price: 400,
    rating: 4.6,
    image:
      "https://themprojects.com/wp-content/uploads/2018/02/dining-room-simple-sideboards-for-dining-room-best-home-design-regarding-most-recently-released-cool-sideboards.jpg",
    category: "Dining Room",
  },

  // Office (5 products)
  {
    id: 16,
    name: "Office Chair",
    price: 350,
    rating: 4.8,
    image:
      "https://images.homedepot-static.com/productImages/a4028db2-0c49-4069-957b-456aeffee556/svn/orange-modway-office-chairs-eei-272-ora-64_1000.jpg",
    category: "Office",
  },
  {
    id: 17,
    name: "Office Desk",
    price: 450,
    rating: 4.5,
    image:
      "https://m.media-amazon.com/images/I/71k6ifp-15L._AC_SL1500_.jpg",
    category: "Office",
  },
  {
    id: 18,
    name: "Desk Lamp",
    price: 75,
    rating: 4.4,
    image:
      "https://ae01.alicdn.com/kf/HTB1ACZMXKALL1JjSZFjq6ysqXXak/Preto-Flex-vel-Bra-o-Oscilante-Montagem-Bra-adeira-de-Mesa-de-Luz-Estudo-Candeeiro-de.jpg",
    category: "Office",
  },
  {
    id: 19,
    name: "Office Bookshelf",
    price: 180,
    rating: 4.6,
    image:
      "https://i5.walmartimages.com/asr/571440d3-0c2f-4809-b0d5-9c24c9420214.f2e677d8070149093c4a3266a2c2a061.jpeg",
      /*
      https://m.media-amazon.com/images/I/81S479aT8tL._AC_SL1500_.jpg
      https://i5.walmartimages.com/asr/89d6a0ff-64b6-4cbf-af64-b441441de1f2.c207e45ae2035ab3e8fb6d4530263d65.jpeg
      https://i5.walmartimages.com/asr/2aa11b00-cc54-4bb1-9b31-1acede2e70c6.6e300fbb75790e5b45a6e46798909444.jpeg
      https://i5.walmartimages.com/asr/327eee44-2472-44f5-bc3b-c5c3b1aec164.223a2379113ab5185201690821fc42d2.jpeg

      https://i.pinimg.com/originals/ae/f7/3d/aef73d1f048ec83b3e57156b50b669e3.png
      */ 
    category: "Office",
  },
  {
    id: 20,
    name: "Filing Cabinet",
    price: 220,
    rating: 4.3,
    image:
      "https://images-oss.2cshop.com/upload/customer_10321/upload/20230829/4529b1f560185a6b9714b35984271801.jpg",
    category: "Office",
  },

  // Kitchen (5 products)
  {
    id: 21,
    name: "Kitchen Island",
    price: 850,
    rating: 4.7,
    image:
      "https://housely.com/wp-content/uploads/2015/05/breathtaking-kitchen-islands-designs-uk.jpg",
    category: "Kitchen",
  },
  {
    id: 22,
    name: "Kitchen Cabinet Set",
    price: 1200,
    rating: 4.8,
    image:
      "https://contentgrid.homedepot-static.com/hdus/en_US/DTCCOMNEW/fetch/collections/staticImages/HamptonWhite-Kitchen1.jpg",
    category: "Kitchen",
  },
  {
    id: 23,
    name: "Counter Stools",
    price: 200,
    rating: 4.4,
    image:
      "https://m.media-amazon.com/images/I/81hnsinSbAL._AC_SL1500_.jpg",
      /*
      https://i5.walmartimages.com/seo/Dycanpo-26-H-Swivel-Counter-Height-Bar-Stools-Set-of-2-with-Back-for-Home
      -Kitchen-Island-Beige_d4da9b41-c41a-4f20-b264-2da43283d9d3.41069ea80a739d547afd88974917c2e4.jpeg
      */
    category: "Kitchen",
  },
  {
    id: 24,
    name: "Corner Bench Dining Set",
    price: 230,
    rating: 4.5,
    image:
      "https://www.lawton-imports.co.uk/wp-content/uploads/2009/12/SCHOSS-ACHENSEE-3.jpg",
    category: "Kitchen",
  },
  {
    id: 25,
    name: "Pantry Storage Cabinet",
    price: 760,
    rating: 4.6,
    image:
      "https://i5.walmartimages.com/seo/HOMCOM-41-Farmhouse-Kitchen-Pantry-Freestanding-2-Door-Storage-Cabinet-with-Adjustable-Shelves-for-Living-Room-and-Dinning-Room-White_6d9ab4a7-fbf1-41f1-a02c-576ef851fafd.72f2a52b46c256f81820c75aee6a8fb2.jpeg",
    category: "Kitchen",
  },

  // Outdoor (5 products)
  {
    id: 26,
    name: "Garden Sofa Set",
    price: 750,
    rating: 4.8,
    image:
      "https://i5.walmartimages.com/asr/388b4360-892d-4c77-9f6d-b869b21e84fb_1.05be0d62e86307294c87c6e7e12ab889.jpeg",
    category: "Outdoor",
  },
  {
    id: 27,
    name: "Wooden Garden Chair",
    price: 190,
    rating: 4.3,
    image:
      "https://chicteak.com/cdn/shop/products/HJ001AC_HIGHCC_01singleOPT3_800x.jpg?v=1655650082",
    category: "Outdoor",
  },
  {
    id: 28,
    name: "Metal Garden Table",
    price: 300,
    rating: 4.2,
    image:
      "https://images.homedepot-static.com/productImages/c599ff53-8c71-42a2-b969-71f46c5798eb/svn/noble-house-patio-dining-tables-53733-64_600.jpg",
    /*Small Metal Patio Table */
      category: "Outdoor",
  },
  {
    id: 29,
    name: "Garden Lounger",
    price: 280,
    rating: 4.5,
    image:
      "https://cdn.shopify.com/s/files/1/0502/4625/4784/files/quay-sunlounger-wide-plain.jpg?v=1683799601",
    category: "Outdoor",
  },
  {
    id: 30,
    name: "Aluminum Patio Umbrella",
    price: 180,
    rating: 4.1,
    image:
      "https://images.thdstatic.com/productImages/208f2fd3-f2c5-48f8-af71-eaeddcd4cfa0/svn/purple-leaf-cantilever-umbrellas-pplglrsm12-nbwb-64_1000.jpg",
    category: "Outdoor",
  },

  // Bathroom (5 products)
{
  id: 31,
  name: "Modern Vanity Unit",
  price: 450,
  rating: 4.6,
  image:
    "https://img5.su-cdn.com/cdn-cgi/image/width=1000,height=1000/mall/file/2023/07/18/36453fb239dfb930d85e508190a90563.jpg",
  category: "Bathroom",
},
{
  id: 32,
  name: "Wall-Mounted Mirror Cabinet",
  price: 180,
  rating: 4.5,
  image:
    "https://m.media-amazon.com/images/I/61d+yXlG1CL.jpg",
  category: "Bathroom",
},
{
  id: 33,
  name: "Towel Storage Tower",
  price: 220,
  rating: 4.4,
  image:
    "https://secure.img1-fg.wfcdn.com/im/27815312/compr-r85/2210/221010372/9-w-x-3346-h-x-9-d-free-standing-bathroom-shelves.jpg",
  category: "Bathroom",
},
{
  id: 34,
  name: "Slim Bathroom Cabinet",
  price: 150,
  rating: 4.3,
  image:
    "https://i.pinimg.com/originals/83/09/9b/83099b98074c6b1c24565fa491811205.jpg",
  category: "Bathroom",
},
{
  id: 35,
  name: "Laundry Hamper Cabinet",
  price: 130,
  rating: 4.2,
  image:
    "https://assets.wfcdn.com/im/24879913/compr-r85/2818/281815824/Begoa+Stainless+Steel+Freestanding+Bathroom+Cabinet.jpg",
  category: "Bathroom",
},


  // Hallway (5 products)
  {
    id: 36,
    name: "Hallway Console Table",
    price: 350,
    rating: 4.6,
    image:
      "https://tribesigns.com/cdn/shop/products/2_1_ce070abd-a825-4ef0-a23f-1e1b3055569b-774622_1799x1799.jpg?v=1694594542",
      /*https://tribesigns.com/cdn/shop/products/farmhouse-console-table-55-sofa-table-wood-entryway-table-758869_700x700.jpg?v=1701507075 */
    category: "Hallway",
  },
  {
    id: 37,
    name: "Wall Mirror",
    price: 150,
    rating: 4.3,
    image:
      "https://malkow.pl/wp-content/uploads/2021/01/Skar%C5%BCy%C5%84ski-3-scaled.jpg",
    category: "Hallway",
  },
  {
    id: 38,
    name: "Shoe Rack",
    price: 200,
    rating: 4.5,
    image:
      "https://img.yitashop.com/fit-in/1000x1000/10001/product/original/202403/BE04FE6C-0E6B-ADF9-60C3-7288E094D9A9.jpg",
    category: "Hallway",
  },
  {
    id: 39,
    name: "Coat Stand",
    price: 180,
    rating: 4.4,
    image:
      "https://www.designideasguide.com/wp-content/uploads/2021/12/Minimalist-Coat-Rack.jpg.webp",
    category: "Hallway",
  },
  {
    id: 40,
    name: "Umbrella Stand",
    price: 100,
    rating: 4.2,
    image: "https://assets.weimgs.com/weimgs/rk/images/wcm/products/202314/0395/yamazaki-umbrella-stand-slim-o.jpg"
    /*"https://img.edilportale.com/product-thumbs/b_VIA-MOX-105792-rel761badeb.jpg"*/,
    category: "Hallway",
  },

  // Other (5 products)
  {
    id: 41,
    name: "Decorative Vase",
    price: 80,
    rating: 4.5,
    image: "https://www.tasteofhome.com/wp-content/uploads/2022/05/floral-ceramic-bud-vase.jpeg",
    /*"https://i.pinimg.com/736x/72/0d/e7/720de73c1167ee79de95cb14fec1e9a2.jpg"
    "https://s7d5.scene7.com/is/image/Anthropologie/59915397_010_b?$a15-pdp-detail-shot$&fit=constrain&qlt=80&wid=640"
    "https://i.etsystatic.com/35185754/c/2000/2000/0/0/il/ed0f7b/4777703031/il_600x600.4777703031_6sgb.jpg"
    "https://www.wedgwood.com/-/media/product-images/wedgwoodamericas/magnolia-jasper/40024001_wedgwoodamericas_07_magnolia-blossom-vase.jpg?q=70&iw=1070&ih=1070&crop=1"*/
    category: "Other",
  },
  {
    id: 42,
    name: "Wall Art",
    price: 150,
    rating: 4.4,
    image: "https://i.etsystatic.com/16137187/r/il/785b07/2421086426/il_fullxfull.2421086426_gwxk.jpg",
    category: "Other",
  }, 
  {
    id: 43,
    name: "Floor Rug",
    price: 120,
    rating: 4.6,
    image: "https://assets.wfcdn.com/im/85785542/compr-r85/2170/217056124/denetris-pinkblue-rug.jpg",
    category: "Other",
  },
  {
    id: 44,
    name: "Curtains",
    price: 180,
    rating: 4.3,
    image: "https://i2.wp.com/theenergylibrary.com/wp-content/uploads/2015/09/where-to-buy-curtains-online.jpg",
    category: "Other",
  },
  // Kids Room 
{
  id: 45,
  name: "Kids Bed",
  price: 400,
  rating: 4.5,
  image:
    "https://m.media-amazon.com/images/I/71Z+RsXhJ0L._AC_SL1500_.jpg",
  category: "Kids Room",
},

{
  id: 46,
  name: "Toy Organizer",
  price: 120,
  rating: 4.3,
  image:
    "https://static.songmics.com/fit-in/750x750/image/Product/UGKR42WT/GKR42WT-3.jpg",
  category: "Kids Room",
},
{
  id: 47,
  name: "Kids Study Desk",
  price: 250,
  rating: 4.6,
  image:
    "https://ae01.alicdn.com/kf/HTB1doTCakL0gK0jSZFxq6xWHVXae/Study-Desk-For-Children-Desk-Solid-Wood-Desk-Chair-Set-Of-Household-Bookcase-Boys-and-Girls.jpg_q50.jpg",
  category: "Kids Room",
},
{
  id: 48,
  name: "Plush Toddler Chair",
  price: 100,
  rating: 4.4,
  image:
    "https://visualhunt.com/photos/15/plush-faux-fur-kids-chair-in-green.jpeg?s=art",
  category: "Kids Room",
},
{
  id: 49,
  name: "Dollhouse Bookcase",
  price: 200,
  rating: 4.2,
  image:
  "https://i.pinimg.com/originals/f7/8f/39/f78f395dd91ad1c40e56554828c1c773.jpg"
    /*"https://www.thebrokebrooke.com/wp-content/uploads/2020/08/JAJ_1016.jpg"*/,
  category: "Kids Room",
},

{
    id: 50,
  name: "Kids Bunk Beds",
  price: 1000,
  rating: 4.4,
  image:
    "https://foter.com/photos/424/double-over-queen-bunk-beds.jpeg"
   /*"https://i5.walmartimages.com/seo/Max-Lily-Twin-over-Twin-Bunk-Bed-for-Kids-Wood-Bunk-Beds-with-Ladder-Natural_1c13a825-dde4-4f98-b7c2-fdb3010cbba2.a430fe117483a227f860cd0101d8095d.jpeg",
  "https://www.happybeds.co.uk/media/catalog/product/cache/1/image/1200x1200/9df78eab33525d08d6e5fb8d27136e95/d/o/domino_white_roomset_1.jpg"*/ ,
    category: "Kids Room",

},

{
    id: 51,
  name: "Adjustable Bed Frame",
  price: 800,
  rating: 4.5,
  image:
    "https://th.bing.com/th/id/R.961bf73f2cbfcfaf11df405c79d8026c?rik=Bj9R1LvV3TDNcw&riu=http%3a%2f%2fwww.bedtech.com%2fcdn%2fshop%2ffiles%2fbedtech-btx4-power-adjustable-bed-split-head-king-queen-002.jpg%3fv%3d1711040219&ehk=ddbyzXKWC5olMOLeK7nBVYtOUm6Agv1%2bFNZUet5zsh0%3d&risl=&pid=ImgRaw&r=0",
    category: "Bedroom",
},

{
    id: 52,
  name: "Double Beds",
  price: 800,
  rating: 4.2,
  image:
    "https://i5.walmartimages.com/seo/Amolife-Queen-Size-Fabric-Upholstered-Platform-Bed-Frame-with-Headboard-Navy-Blue_b6ea4927-ac46-4859-9f54-3f2292d3db2a.a1e617c4a02b42597036d9c6c1ff12ee.jpeg",
    category: "Bedroom",
},

{    id: 53,
  name: "Wooden Dining Table",
  price: 480,
  rating: 4.5,
  image: 'https://ak1.ostkcdn.com/images/products/is/images/direct/630b272777237219a041e7896e61c2dcbcb0cdb6/47-Inch-Round-Dining-Table-for-4%2CKitchen-Farmhouse-Dinner-Table%2CWood-Dinning-Table-for-Kitchen-Dining-Living-Room.jpg',
    /*"https://assets.wfcdn.com/im/89029686/compr-r85/2728/272847987/Kuuipo+Round+Dining+Table.jpg"*/
    category: "Dining Room",

},

{    id: 54,
  name: "Cozy Armchair",
  price: 300,
  rating: 4.3,
  image: 'https://thearchitecturedesigns.com/wp-content/uploads/2023/03/Upholstery-History-2-1024x1024.jpeg',
    category: "Living Room",

},

{    id: 55,
  name: "Drawer Dresser cabinet",
  price: 599,
  rating: 4.4,
  image: /*'https://res.litfad.com/site/img/item/2023/03/14/8006230/1200x1200.jpg'
    "https://assets.weimgs.com/weimgs/ab/images/wcm/products/202302/0701/anton-solid-wood-closed-nightstand-16-36-z.jpg"*/
    "https://furnicut.com/public/uploads/all/XVtJZt9VafsUV3nEQU3mT613WXgAM9hZ87jRDm3K.jpg",
    category: "Bedroom",

}
];

 // Find product by id
  const product = allProducts.find((p) => p.id === productId);

  const [reviews, setReviews] = useState([
    {
      id: 1,
      username: "Alice",
      rating: 5,
      comment: "Great product, very comfortable!",
      date: "2024-01-01",
    },
    {
      id: 2,
      username: "Bob",
      rating: 4,
      comment: "Nice quality but a bit pricey.",
      date: "2024-02-15",
    },
  ]);

  const [visibleCount, setVisibleCount] = useState(3);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  if (!product) {
    return (
      <div className="not-found">
        <h2>Product not found</h2>
        <p>Sorry, we couldn't find the product you're looking for.</p>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newRating === 0 || newComment.trim() === "") {
      alert("Please provide a rating and a comment.");
      return;
    }

    const newReview = {
      id: reviews.length + 1,
      username: "Anonymous",
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split("T")[0],
    };

    setReviews([newReview, ...reviews]);
    setNewRating(0);
    setNewComment("");
  };

return (
  <div className="pd-container">
    <div className="pd-info-wrapper">
      <div className="pd-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="pd-summary">
        <h1>{product.name}</h1>
        <p className="pd-description">{product.description}</p>
        <p className="pd-price">${product.price.toFixed(2)}</p>
        <button className="pd-add-to-cart" onClick={() => addToCart(product)}>
          🛒 Add to Cart
        </button>
      </div>
    </div>

    <div className="pd-rating-summary">
      <StarRating rating={avgRating} />
      <span className="pd-avg-score">{avgRating.toFixed(1)} / 5</span>
      <span className="pd-review-count">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
    </div>

    <div className="pd-reviews">
  <h2>Customer Reviews</h2>
  {reviews.slice(0, visibleCount).map((r) => (
    <div key={r.id} className="pd-review-card">
      <div className="pd-review-avatar">
        {r.username ? r.username.charAt(0).toUpperCase() : "A"}
      </div>
      <div className="pd-review-content">
        <div className="pd-review-header">
          <span className="pd-review-name">{r.username}</span>
          <span className="pd-review-date">{r.date}</span>
        </div>
        <div className="pd-review-stars">
          <StarRating rating={r.rating} />
        </div>
        <div className="pd-review-text">{r.comment}</div>
      </div>
    </div>
  ))}

  {visibleCount < reviews.length && (
    <button
      className="pd-load-more"
      onClick={() => setVisibleCount((c) => c + 3)}
    >
      Load More
    </button>
  )}
</div>


    <div className="pd-add-review">
      <h2>Add a Review</h2>
      <form onSubmit={handleSubmitReview}>
        <label>Your Rating: </label>
        <StarRating rating={newRating} editable onChange={setNewRating} />
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          placeholder="Write your review here..."
          required
        />
        <button type="submit" className="pd-submit-review">Submit review</button>
      </form>
    </div>
  </div>
);
}