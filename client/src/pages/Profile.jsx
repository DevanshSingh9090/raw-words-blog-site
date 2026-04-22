import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getEvn } from "@/helpers/getEnv";
import { showToast } from "@/helpers/showToast";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { useFetch } from "@/hooks/useFetch";
import Loading from "@/components/Loading";
import { IoCameraOutline, IoEyeOutline, IoEyeOffOutline, IoChevronForwardOutline } from "react-icons/io5";
import Dropzone from "react-dropzone";
import { setUser } from "@/redux/user/user.slice";
import usericon from "@/assets/images/user.png";

const Profile = () => {
  const [filePreview, setPreview] = useState();
  const [file, setFile] = useState();
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const user = useSelector((state) => state.user);

  const {
    data: userData,
    loading,
    error,
  } = useFetch(
    `${getEvn("VITE_API_BASE_URL")}/user/get-user/${user.user._id}`,
    { method: "get", credentials: "include" }
  );

  const dispatch = useDispatch();

  const formSchema = z
    .object({
      name: z.string().min(3, "Name must be at least 3 characters.").or(z.literal("")),
      email: z.string().email("Invalid email address.").or(z.literal("")),
      bio: z.string().optional(),
      currentPassword: z.string().optional(),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters.")
        .or(z.literal(""))
        .optional(),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.newPassword && data.newPassword.length > 0) {
          return data.newPassword === data.confirmPassword;
        }
        return true;
      },
      {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword && data.newPassword.length > 0) {
          return data.currentPassword && data.currentPassword.length > 0;
        }
        return true;
      },
      {
        message: "Current password is required.",
        path: ["currentPassword"],
      }
    );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (userData && userData.success) {
      form.reset({
        name: userData.user.name || "",
        email: userData.user.email || "",
        bio: userData.user.bio || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [userData]);

  async function onSubmit(values) {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        bio: values.bio,
      };

      if (showPasswordSection && values.newPassword) {
        payload.currentPassword = values.currentPassword;
        payload.newPassword = values.newPassword;
      }

      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("data", JSON.stringify(payload));

      const response = await fetch(
        `${getEvn("VITE_API_BASE_URL")}/user/update-user/${userData.user._id}`,
        {
          method: "put",
          credentials: "include",
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return showToast("error", data.message);
      }
      dispatch(setUser(data.user));
      showToast("success", data.message);

      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
      setShowPasswordSection(false);
    } catch (error) {
      showToast("error", error.message);
    }
  }

  const handleFileSelection = (files) => {
    const f = files[0];
    const preview = URL.createObjectURL(f);
    setFile(f);
    setPreview(preview);
  };

  const handleCancel = () => {
    if (userData && userData.success) {
      form.reset({
        name: userData.user.name || "",
        email: userData.user.email || "",
        bio: userData.user.bio || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setShowPasswordSection(false);
    setPreview(null);
    setFile(null);
  };

  if (loading) return <Loading />;

  return (
    <Card className="max-w-screen-md mx-auto">
      <CardContent>
        {/* Avatar */}
        <div className="flex justify-center items-center mt-10 mb-6">
          <Dropzone onDrop={(acceptedFiles) => handleFileSelection(acceptedFiles)}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Avatar className="w-28 h-28 relative group overflow-hidden">
                  <AvatarImage
                    src={
                      filePreview ||
                      (userData?.user?.avatar?.trim()
                        ? userData.user.avatar
                        : usericon)
                    }
                    alt="User Avatar"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute z-50 w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 justify-center items-center bg-black bg-opacity-20 border-2 border-violet-500 rounded-full group-hover:flex hidden cursor-pointer">
                    <IoCameraOutline color="#7c3aed" size={24} />
                  </div>
                </Avatar>
              </div>
            )}
          </Dropzone>
        </div>

        <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide font-medium border-b pb-2">
          Profile info{" "}
          <span className="normal-case font-normal tracking-normal">
            — all fields optional
          </span>
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="mb-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bio */}
            <div className="mb-3">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell readers about yourself..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password Section Toggle */}
            <div className="mt-5 pt-5 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection((v) => !v);
                  if (showPasswordSection) {
                    form.setValue("currentPassword", "");
                    form.setValue("newPassword", "");
                    form.setValue("confirmPassword", "");
                  }
                }}
                className="flex items-center gap-2 text-sm text-foreground mb-4 hover:text-violet-600 transition-colors"
              >
                <IoChevronForwardOutline
                  size={14}
                  className={`transition-transform duration-200 ${
                    showPasswordSection ? "rotate-90" : ""
                  }`}
                />
                Change password
              </button>

              {showPasswordSection && (
                <div className="space-y-3">
                  {/* Current Password */}
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPass ? "text" : "password"}
                              placeholder="Enter current password"
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPass((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showCurrentPass ? (
                                <IoEyeOffOutline size={16} />
                              ) : (
                                <IoEyeOutline size={16} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* New Password */}
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPass ? "text" : "password"}
                              placeholder="At least 8 characters"
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPass((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showNewPass ? (
                                <IoEyeOffOutline size={16} />
                              ) : (
                                <IoEyeOutline size={16} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Must be at least 8 characters.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm new password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPass ? "text" : "password"}
                              placeholder="Repeat new password"
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPass((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPass ? (
                                <IoEyeOffOutline size={16} />
                              ) : (
                                <IoEyeOutline size={16} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-none"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Profile;
