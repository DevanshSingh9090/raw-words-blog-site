import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RouteAddCategory, RouteEditCategory } from '@/helpers/RouteName'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useFetch } from '@/hooks/useFetch'
import { getEvn } from '@/helpers/getEnv'
import Loading from '@/components/Loading'
import { FiEdit } from "react-icons/fi"
import { FaRegTrashAlt } from "react-icons/fa"
import { deleteData } from '@/helpers/handleDelete'
import { showToast } from '@/helpers/showToast'
import ConfirmDialog from '@/components/ConfirmDialog'

const CategoryDetails = () => {
    const [refreshData, setRefreshData] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    const { data: categoryData, loading, error } = useFetch(
        `${getEvn('VITE_API_BASE_URL')}/category/all-category`,
        { method: 'get', credentials: 'include' },
        [refreshData]
    )

    const handleDeleteClick = (id) => {
        setDeleteId(id)
    }

    const handleDeleteConfirm = async () => {
        const response = await deleteData(
            `${getEvn('VITE_API_BASE_URL')}/category/delete/${deleteId}`
        )
        if (response) {
            setRefreshData(!refreshData)
            showToast('success', 'Category deleted.')
        } else {
            showToast('error', 'Could not delete category.')
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
                title="Delete category?"
                description="This will permanently remove the category and cannot be undone."
            />

            <Card>
                <CardHeader>
                    <div>
                        <Button asChild>
                            <Link to={RouteAddCategory}>Add Category</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categoryData && categoryData.category.length > 0 ? (
                                categoryData.category.map(category => (
                                    <TableRow key={category._id}>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>{category.slug}</TableCell>
                                        <TableCell className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                className="hover:bg-violet-500 hover:text-white"
                                                asChild
                                            >
                                                <Link to={RouteEditCategory(category._id)}>
                                                    <FiEdit />
                                                </Link>
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteClick(category._id)}
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
                                    <TableCell colSpan="3">No categories found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default CategoryDetails
