"use client";

import { ServerWithMembersWithProfiles } from "@/types";
import { MemberRole } from "@prisma/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from "lucide-react";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useModal } from "@/hooks/use-modal-store";

interface ServerHeaderProps {
    server: ServerWithMembersWithProfiles;
    role?: MemberRole;
};

export const ServerHeader = ({
    server,
    role
}: ServerHeaderProps) => {
    const { onOpen } = useModal();
    const isServerOwner = role === MemberRole.SERVEROWNER;
    const isViceServerOwner = isServerOwner || role === MemberRole.VICESERVEROWNER;

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger
                    className="focus:outline-none" asChild
                >
                    <button className="w-full text-md font-semibold 
                    px-3 flex items-center h-12 
                    border-neutral-200 dark:border-neutral-800 
                    border-b-2 hover:bg-zinc-700/10 
                    dark:hover:bg-zinc-700/50 transition">
                        {server.name}
                        <ChevronDown className="hidden md:!block h-5 w-5 ml-auto" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-56 text-xs 
                    font-medium text-white 
                    dark:text-gray-500 space-y-[2px] bg-black border border-neutral-700"
                >
                    {isViceServerOwner && (
                        <DropdownMenuItem
                            onClick={() => onOpen("invite", { server })}
                            className="px-3 py-2 text-sm cursor-pointer 
                            text-indigo-600 dark:text-indigo-400 
                            hover:bg-gray-100 dark:hover:bg-zinc-700 
                            transition rounded-md flex items-center"
                        >
                            Invite People
                            <UserPlus className="h-4 w-4 ml-auto">

                            </UserPlus>
                        </DropdownMenuItem>
                    )}
                    {isServerOwner && (
                        <DropdownMenuItem
                            onClick={() => onOpen("editServer", { server })}
                            className="px-3 py-2 text-sm cursor-pointer
                            hover:bg-gray-100 dark:hover:bg-zinc-700 
                            transition rounded-md flex items-center"
                        >
                            Server Settings
                            <Settings className="h-4 w-4 ml-auto"></Settings>
                        </DropdownMenuItem>
                    )}
                    {isServerOwner && (
                        <DropdownMenuItem
                            onClick={() => onOpen("members", { server })}
                            className="px-3 py-2 text-sm cursor-pointer
                            hover:bg-gray-100 dark:hover:bg-zinc-700 
                            transition rounded-md flex items-center"
                        >
                            Manage Members
                            <Users className="h-4 w-4 ml-auto" />
                        </DropdownMenuItem>
                    )}
                    {isServerOwner && (
                        <DropdownMenuItem
                            onClick={() => onOpen("createChannel")}
                            className="px-3 py-2 text-sm cursor-pointer
                            hover:bg-gray-100 dark:hover:bg-zinc-700 
                            transition rounded-md flex items-center"
                        >
                            Create Channel
                            <PlusCircle className="h-4 w-4 ml-auto"></PlusCircle>
                        </DropdownMenuItem>
                    )}
                    {isServerOwner && (
                        <DropdownMenuSeparator className="bg-gray-300 dark:bg-gray-900 h-1" />
                    )}
                    {isServerOwner && (
                        <DropdownMenuItem
                            onClick={() => onOpen("deleteServer", { server })}
                            className="px-3 py-2 text-sm cursor-pointer
                            hover:bg-gray-100 dark:hover:bg-zinc-800
                            transition rounded-md flex items-center text-rose-500"
                        >
                            Delete Server
                            <Trash className="h-4 w-4 ml-auto"></Trash>
                        </DropdownMenuItem>
                    )}
                    {!isServerOwner && (
                        <DropdownMenuItem
                            onClick={() => onOpen("leaveServer", { server })}
                            className="px-3 py-2 text-sm cursor-pointer
                            hover:bg-gray-100 dark:hover:bg-zinc-800
                            transition rounded-md flex items-center text-rose-500"
                        >
                            Leave Server
                            <LogOut className="h-4 w-4 ml-auto"></LogOut>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}