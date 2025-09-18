"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "../action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export const NavigationAction = () => {
    const { onOpen } = useModal();
    return (
        <div>
            <ActionTooltip side="right" align="center" label="Add a server">
                <button
                    onClick={() => onOpen("createServer")}
                    className="group flex items-center"
                >
                    <div className="flex mx-3 h-[48px] w-[48px] items-center justify-center 
                    rounded-[24px] group-hover:rounded-[16px] transition-all 
                    overflow-hidden bg-gray-500 
                    dark:bg-neutral-700 group-hover:bg-emerald-500">
                        <Plus
                            className="group-hover:text-white transition 
                            text-emerald-500"
                            size={25}
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    )
}