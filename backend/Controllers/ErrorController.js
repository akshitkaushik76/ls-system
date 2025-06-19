module.exports = (error,req,res,next)=>{
    error.StatusCode = error.StatusCode|| 500;
    error.status = error.status || 'error';
    res.status(error.StatusCode).json({
        status:error.status,
        message:error.message
    })
}