"use client";

import githubLogo from "@/img/githubLogo.png";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";

export function Footer() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <footer>
      {session?.user && (
        <div className="flex items-center gap-4 justify-center">
          <div className="text-sm">
            <p className="font-medium">
              Logged in as {session.user.nickname || session.user.firstName}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="text-xs px-2 py-1"
          >
            Logout
          </Button>
        </div>
      )}

      <div className="flex space-x-2 p-4 items-center justify-center">
        <p>
          &copy;{new Date().getFullYear()}{" "}
          <Link
            href="https://soulsbros.ch"
            target="_blank"
            className="hover:text-blue-600"
          >
            Soulsbros
          </Link>
        </p>
        <Link
          href="https://github.com/Steeven9/foodalyzer"
          target="_blank"
          className="hover:rotate-45 transition-all"
        >
          <Image src={githubLogo} width={32} alt="GitHub logo" />
        </Link>
      </div>
    </footer>
  );
}
