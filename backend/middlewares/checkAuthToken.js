const jwt=require('jsonwebtoken');

function checkAuth(req,res,next){
    const authToken=req.cookies.authToken;
    const refreshToken=req.cookies.refreshToken;

    //if either of the two tokens is missing
    if(!authToken || !refreshToken){
        return res.status(401).json({message:'Unauthorised, you need to login'});
    }
    //now none of the tokens is missing
    //first check the authToken if its correct or not

    jwt.verify(authToken, process.env.JWT_SECRET_KEY,(err,decoded)=>{
        if(err){
            //authToken is invalid so let us check refresh token
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY,(refreshErr, refreshDecoded)=>{
                //if refresh token is also invalid then user needs to login again
                if(refreshErr){
                    return res.status(401).json({message:'Unauthorised, you need to login'});
                }
                //if refresh token is valid then tokens will be refreshed 
                else{
                    const newAuthToken = jwt.sign({ userId: refreshDecoded.userId }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
                    const newRefreshToken = jwt.sign({ userId: refreshDecoded.userId }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '10d' })
                    res.cookie('authToken', newAuthToken, {
                        sameSite: 'none',
                        httpOnly: true,
                        secure: true
                    });

                    res.cookie('refreshToken', newRefreshToken, {
                        sameSite: 'none',
                        httpOnly: true,
                        secure: true
                    });

                    req.userId = refreshDecoded.userId;
                    req.ok = true;
                    req.message = "Authentication successful";
                    next();
                }
            })
        }
        else{
             req.userId = decoded.userId;
             req.ok = true;
             req.message = "Authentication successful";
             next();
        }
    })
    
}

module.exports=checkAuth;
