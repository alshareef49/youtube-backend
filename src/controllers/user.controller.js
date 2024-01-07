import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res)=>{
  const {username,fullname,email,password} = req.body;
//   console.log(username,fullname,email,password);
  if(
    [email,fullname,password,username].some((value)=> value?.trim()==="")
  ){
    throw new ApiError(400,"All fields are required!");
  }

  const existeduser = User.findOne({
    "$or":[{ username },{ email }]
  })
  // console.log(existeduser.username==null);
  if(existeduser.username!=null){
    throw new ApiError(409,"User with username or email Already exist!");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(400,"Avatar file is required!");
  }

  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || ""

  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while creating a user");
  }

  res.status(201).json(
    new ApiResponse(200,createdUser,"user created successfully!")
  )
});


export { registerUser }
