import type { Request, Response, NextFunction } from "express"
import createSupabaseClient from "../utils/supabase/client"
import {prisma} from "../config/db"

const client = createSupabaseClient;

export async function middleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers.authorization

    const data = await client.auth.getUser(token);
    const supabaseUser = data.data.user;

    if(supabaseUser?.id){
        await prisma.user.upsert({
            where: {
                supabaseID: supabaseUser.id,
            },
            update: {},
            create: {
                email: supabaseUser.email ?? "",
                supabaseID: supabaseUser.id,
                provider: supabaseUser.app_metadata.provider === "google" ? "Google" : "Github",
                name: supabaseUser.user_metadata.name ?? supabaseUser.email ?? "Anonymous",
            }
        });

        req.userId = supabaseUser.id;
        next();
    }
    else{
        res.status(403).json({
            message: "Unauthorized"
        });
    }
}