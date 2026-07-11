//two ways for handling error using try catch and promises ,we will use try catch easy to understand  promise one is also easy
//using promise
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }




// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }

//usinf try catch
// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (err) {
// next(err)
//     }
// }
