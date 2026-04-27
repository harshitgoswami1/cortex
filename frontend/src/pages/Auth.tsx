// function import kiya idhar
import { createClient } from "@/lib/supabase/client"


// function ko call kar diya client banaa ne ke liye.
const supabase = createClient();

export default function Auth() {

    async function login(provider: "google" | "github") {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider:provider
        })

        if(error) {
            alert("trouble signing in")
        }else{
            alert("signed in successfully")
        }
    }

    return (
        <div>
            <button onClick={() => login("google")}>Login with google</button>
            <button onClick={() => login("github")}>Login with github</button>
        </div>
    )
}