"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  Wrench,
  BookMarked,
  User,
  Settings,
  MessageCircle,
  WandSparkles,
  Zap,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  {
    href: "/",
    icon: Wrench,
    label: "Mã lỗi",
  },
  {
    href: "/hydraulic-analysis",
    icon: Zap,
    label: "Tra cứu mạch điện",
  },
  {
    href: "/maintenance",
    icon: BookMarked,
    label: "Tra cứu Tài liệu",
  },
  {
    href: "/guided-diagnostics",
    icon: WandSparkles,
    label: "Chẩn đoán Hướng dẫn",
  },
  {
    href: "/chatbot",
    icon: MessageCircle,
    label: "Hỏi Đáp AI",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Cài đặt",
  },
];

function ClientNav() {
  const pathname = usePathname();
  return (
      <SidebarMenu>
          {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                  >
                      <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
          ))}
      </SidebarMenu>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-lg font-semibold font-headline">
                Hệ Thống Tra Cứu Tài Liệu
              </span>
            </div>
          </SidebarHeader>
           {isClient ? <ClientNav /> : (
            <div className="flex flex-col gap-1 p-2">
              {navItems.map((item) => (
                <SidebarMenuSkeleton key={item.href} showIcon />
              ))}
            </div>
          )}
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col h-svh p-4 md:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-6 shrink-0">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/01.png" alt="@user" />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Kỹ thuật viên</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    tech@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Cài đặt</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
