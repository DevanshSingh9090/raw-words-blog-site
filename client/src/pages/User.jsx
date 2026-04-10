import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useFetch } from "@/hooks/useFetch"
import { getEvn } from "@/helpers/getEnv"
import Loading from "@/components/Loading"
import { FaRegTrashAlt } from "react-icons/fa"
import { deleteData } from "@/helpers/handleDelete"
import { showToast } from "@/helpers/showToast"
import usericon from "@/assets/images/user.png"
import moment from "moment"
import ConfirmDialog from "@/components/ConfirmDialog"

const User = () => {
  const [refreshData, setRefreshData] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const { data, loading, error } = useFetch(
    `${getEvn("VITE_API_BASE_URL")}/user/get-all-user`,
    { method: "get", credentials: "include" },
    [refreshData]
  )

  const handleDeleteConfirm = async () => {
    const response = await deleteData(
      `${getEvn("VITE_API_BASE_URL")}/user/delete/${deleteId}`
    )
    if (response) {
      setRefreshData(!refreshData)
      showToast("success", "User deleted.")
    } else {
      showToast("error", "Could not delete user.")
    }
    setDeleteId(null)
  }

  if (loading) return <Loading />

  return (
    <div>
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this user?"
        description="This will permanently remove the user account and cannot be undone."
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Avatar</TableHead>
                <TableHead>Dated</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.user.length > 0 ? (
                data.user.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <img
                        src={user.avatar?.trim() ? user.avatar : usericon}
                        alt="avatar"
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    </TableCell>
                    <TableCell>{moment(user.createdAt).format("DD-MM-YYYY")}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => setDeleteId(user._id)}
                        variant="outline"
                        className="hover:bg-red-500 hover:text-white"
                      >
                        <FaRegTrashAlt />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="6">No users found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default User
