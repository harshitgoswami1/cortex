import type { Request, Response, NextFunction } from "express"
import createSupabaseClient from "../utils/supabase/client"

const client = createSupabaseClient;

export async function middleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers.authorization
    
    const data = await client.auth.getUser(token);
    const userid = data.data.user?.id
    if(userid){
        req.userId = userid;
        next();
    }
    else{
        res.status(403).json({
            message:"incorrect inputs"
        })
    }
}