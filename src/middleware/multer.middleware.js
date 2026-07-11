import multer from "multer";



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
  //  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  },

  
})

//above one tells multer:

//where to store file
//what filename to use

//   const upload = multer({
    //  storage
    // })

    // export{
    //     upload
    // }

    //or
    export const upload = multer({
      storage
     })