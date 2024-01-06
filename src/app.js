import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

app = express();
app.use(cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit:"16kb"}));
app.use(urlencoded({extended,limit:"16kb"}));
app.use(express.static("public"));


export  {app};