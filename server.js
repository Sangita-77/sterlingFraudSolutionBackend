import dotenv from "dotenv";
dotenv.config(); 
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

connectDB();

const PORT = process.env.PORT; // 👈 IMPORTANT

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



// import app from "./src/app.js";

// import connectDB from "./src/config/db.js";

// import { env } from "./src/config/env.js";


// connectDB();

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });




// // app.listen(env.PORT, () => {

// //   console.log(`🚀 Server running on port ${env.PORT}`);

// // });
