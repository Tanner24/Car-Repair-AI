"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, Trash2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Task = {
  id: number;
  task: string;
  vehicle: string;
  dueDate: string;
  status: "Đang chờ xử lý" | "Đã hoàn thành";
};

const initialTasks: Task[] = [
  {
    id: 1,
    task: "Thay dầu động cơ",
    vehicle: "Komatsu PC200-8",
    dueDate: "2024-08-15",
    status: "Đang chờ xử lý",
  },
  {
    id: 2,
    task: "Thay bộ lọc thủy lực",
    vehicle: "CAT 320D",
    dueDate: "2024-08-20",
    status: "Đang chờ xử lý",
  },
  {
    id: 3,
    task: "Kiểm tra bộ lọc không khí",
    vehicle: "Hitachi EX120-5",
    dueDate: "2024-07-30",
    status: "Đã hoàn thành",
  },
  {
    id: 4,
    task: "Điều chỉnh độ căng của xích",
    vehicle: "Komatsu PC200-8",
    dueDate: "2024-09-01",
    status: "Đang chờ xử lý",
  },
];

export function MaintenanceScheduler() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newTask: Task = {
      id: tasks.length + 1,
      task: formData.get("task") as string,
      vehicle: formData.get("vehicle") as string,
      dueDate: formData.get("dueDate") as string,
      status: "Đang chờ xử lý",
    };
    setTasks([...tasks, newTask]);
    setIsDialogOpen(false);
  };

  const toggleStatus = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Đang chờ xử lý" ? "Đã hoàn thành" : "Đang chờ xử lý",
            }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Nhiệm vụ sắp tới</CardTitle>
          <CardDescription>
            Danh sách các công việc bảo trì đã lên lịch cho thiết bị của bạn.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm nhiệm vụ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhiệm vụ bảo trì mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTask}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="task" className="text-right">Nhiệm vụ</Label>
                  <Input id="task" name="task" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vehicle" className="text-right">Xe</Label>
                  <Input id="vehicle" name="vehicle" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">Ngày hết hạn</Label>
                  <Input id="dueDate" name="dueDate" type="date" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Hủy</Button>
                </DialogClose>
                <Button type="submit" className="bg-accent hover:bg-accent/90">Thêm nhiệm vụ</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Nhiệm vụ</TableHead>
              <TableHead>Xe</TableHead>
              <TableHead>Ngày hết hạn</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Badge
                    variant={task.status === "Đã hoàn thành" ? "secondary" : "default"}
                    className={task.status === "Đã hoàn thành" ? "" : "bg-accent text-accent-foreground"}
                  >
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{task.task}</TableCell>
                <TableCell>{task.vehicle}</TableCell>
                <TableCell>{task.dueDate}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleStatus(task.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        <span>Chuyển đổi trạng thái</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Xóa</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
