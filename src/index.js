import "dotenv/config";
import { connectDB } from "./db/index.js";
const port = process.env.PORT || 8000;
import {app} from "./app.js";
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is running at port:${port}`);
    });
  })
  .catch((err) => {
    console.log();
  });
