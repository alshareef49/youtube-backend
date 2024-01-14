import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userId)=>{
  try {
    
    const user = await User.findById(userId);
    const accesstoken = user.generateAccesstoken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return {accesstoken, refreshToken}

  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token!");
  }
}

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

  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let avatarLocalPath;
  if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
    avatarLocalPath = req.files.avatar[0].path
}
  let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

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

const loginUser = asyncHandler( async (req,res)=>{

  const  { username, email, password } = req.body;

  if(!username || !email){
    throw new ApiError(400,"username or emmail is required!!");
  }

  const user = await User.findOne({
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"User does not exist!!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
  }

  const {accesstoken, refreshToken} = await generateAccessAndRefreshToken(user._id);

  const logedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken",accesstoken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user: logedInUser, accesstoken, refreshToken
      },
      "User loggedIn Successfully!"
    )
  )


})

const logoutUser = asyncHandler( async(req,res)=>{
  await User.findByIdAndUpdate(
     req.user._id,
     {
      "$set":{refreshToken: undefined}
     },
     {
      new: true
     }
  )
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User logged Out successfully")
  )

})

export { registerUser, loginUser ,logoutUser}
