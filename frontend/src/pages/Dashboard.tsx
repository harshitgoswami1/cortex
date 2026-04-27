import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const supabase = createClient();

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function getUser() {
            const { data } = await supabase.auth.getUser();
            setUser(data.user ?? null);
            setLoading(false);
        }

        getUser();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {!user && (
                <button onClick={() => navigate("/auth")}>
                    Sign In
                </button>
            )}

            {user && (
                <div>
                    {user.email}
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            setUser(null);
                        }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}