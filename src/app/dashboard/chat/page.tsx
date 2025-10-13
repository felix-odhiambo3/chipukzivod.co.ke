
'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChatPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [hasAgreed, setHasAgreed] = useState(false);

    // Replace this with your actual Minnit chat URL
    const minnitChatUrl = "https://minnit.chat/YourChatName";

    if (isUserLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        router.replace('/login');
        return null;
    }

    const handleJoinChat = () => {
        setHasAgreed(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Community Live Chat</h1>
                <p className="text-muted-foreground">
                    Connect with other members in real-time.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Chat Room</CardTitle>
                </CardHeader>
                <CardContent>
                    {!hasAgreed ? (
                        <div className="max-w-2xl mx-auto text-center">
                            <Alert variant="default" className="text-left mb-6 bg-amber-50 border-amber-200 text-amber-900 [&>svg]:text-amber-600">
                                <ShieldCheck className="h-4 w-4" />
                                <AlertTitle>Privacy Notice</AlertTitle>
                                <AlertDescription>
                                    This chat is configured so that the moderation team can view personal data (including your IP Address) when you send messages. The moderation team may use this data for various reasons, including analytical data, or verifying user's identities. Minnit LTD does not have control over how they process this data. Click Join to agree to this and begin chatting.
                                </AlertDescription>
                            </Alert>
                            <Button onClick={handleJoinChat} size="lg">Join Chat</Button>
                        </div>
                    ) : (
                        <div className="aspect-video w-full rounded-lg overflow-hidden border">
                            <iframe 
                                src={minnitChatUrl} 
                                className="w-full h-full"
                                allow="fullscreen"
                                title="Live Chat Room"
                            ></iframe>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
