"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import qs from "query-string"

export const DeleteChannelModal = () => { 
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    const isModalOpen = isOpen && type === "deleteChannel";
    const { server, channel } = data;
    const [isLoading, setIsLoading] = useState(false);
    const onClick = async () => {
        try {
            setIsLoading(true);
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id
                }
            })
            await axios.delete(url);
            onClose();
            router.refresh();
            router.push(`/servers/${server?.id}`);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-black text-white overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Ǎ̶̢̻̟̭̻̂͑̌́A̵̫̭̹͖̩͌̀̐͋̒À̶̛̳̗̫̫̠̐͑̉Ȧ̴̗̺͕͎̞̀̾̃̾A̶̛̮̮̜̟͐̾̚͝ͅ
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are u sure u want to delete this channel? u really want to do this son? <br />
                        <span className="font-semibold text-green-700">#{channel?.name}</span> will be gone forever. <br />
                        it all returns to nothing.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter
                    className="px-6 py-1"
                >
                    <div
                        className="flex items-center justify-between w-full"
                    >   
                        <Button 
                            disabled={isLoading}
                            onClick={onClose}
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isLoading}
                            variant="default"
                            onClick={onClick}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}