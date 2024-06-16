"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

const FormSchema = z.object({
  name: z.string().nonempty(),
  password: z.string().nonempty().min(4).max(4),
  contact_info: z.string().nonempty().min(8).max(10),
  role: z.string().nonempty(),
  shift: z
    .string({
      required_error: "Shift is required",
    })
    .nonempty(),
});

const AddNewStaff = ({ onAdd }: { onAdd: () => void }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      password: "",
      contact_info: "",
      role: "",
      shift: "",
    },
  });

  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);

  const fetchShifts = async () => {
    try {
      const response = await axios.get("/api/shift");
      setShifts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    }
  };

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const addStaff = async () => {
      setPending(true);
      const response = await axios.post("/api/employee", data);

      if (response.status === 200) {
        form.reset();
        onAdd();
        setPending(false);
      }
    };

    addStaff();
  };

  const onClick = () => {
    fetchShifts();
  };

  return (
    <Dialog>
      <DialogTrigger
        onClick={onClick}
        className="flex items-center justify-center rounded-md bg-primary h-9 px-3 text-primary-foreground"
      >
        <PlusCircle className="h-4 w-4 mr-1" />
        <span className="sr-only text-sm font-medium sm:not-sr-only sm:whitespace-nowrap">
          Add Staff
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new Staff</DialogTitle>
          <DialogDescription>Add a new staff to your team.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Fullname</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex items-center gap-x-5">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shift"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Shift</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="none" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          shifts?.map((shift: any) => (
                            <SelectItem key={shift.id} value={shift.name}>
                              {shift.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full flex items-center gap-x-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Pin (4 digits)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_info"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full flex justify-end">
              <Button type="submit" className="mr-3" disabled={pending}>
                {pending ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewStaff;
