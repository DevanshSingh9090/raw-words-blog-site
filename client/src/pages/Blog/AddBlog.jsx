import React, { useEffect, useRef, useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import slugify from 'slugify'
import { showToast } from '@/helpers/showToast'
import { getEvn } from '@/helpers/getEnv'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useFetch } from '@/hooks/useFetch'
import Dropzone from 'react-dropzone'
import Editor from '@/components/Editor'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RouteBlog } from '@/helpers/RouteName'
import { Sparkles, Loader2 } from 'lucide-react'

const AddBlog = () => {
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)
    const editorRef = useRef(null)
    const [aiLoading, setAiLoading] = useState(false)

    const { data: categoryData } = useFetch(`${getEvn('VITE_API_BASE_URL')}/category/all-category`, {
        method: 'get',
        credentials: 'include'
    })

    const [filePreview, setPreview] = useState()
    const [file, setFile] = useState()

    const formSchema = z.object({
        category: z.string().min(3, 'Category must be at least 3 character long.'),
        title: z.string().min(3, 'Title must be at least 3 character long.'),
        slug: z.string().min(3, 'Slug must be at least 3 character long.'),
        blogContent: z.string().min(3, 'Blog content must be at least 3 character long.'),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: '',
            title: '',
            slug: '',
            blogContent: '',
        },
    })

    const handleEditorData = (event, editor) => {
        const data = editor.getData()
        form.setValue('blogContent', data)
    }

    const blogTitle = form.watch('title')

    useEffect(() => {
        if (blogTitle) {
            const slug = slugify(blogTitle, { lower: true })
            form.setValue('slug', slug)
        }
    }, [blogTitle])

    const handleGenerateWithAI = async () => {
        const title = form.getValues('title')
        const categoryId = form.getValues('category')
        const existingContent = form.getValues('blogContent')

        if (!title && !categoryId) {
            showToast('error', 'Please enter at least a title or select a category before generating.')
            return
        }

        const categoryName = categoryData?.category?.find(c => c._id === categoryId)?.name || ''

        const prompt = `Write a well-structured, engaging blog post in HTML format.
${categoryName ? `Category: ${categoryName}` : ''}
${title ? `Title: ${title}` : ''}
${existingContent ? `Expand on this existing content:\n${existingContent}` : ''}

Requirements:
- Use proper HTML tags (h2, h3, p, ul, li, strong, em)
- Write at least 3-4 paragraphs
- Make it informative and engaging
- Do NOT include the main h1 title tag, start directly with the body content
- Return only the HTML content, no markdown or code fences`

        try {
            setAiLoading(true)
            const apiKey = getEvn('VITE_GEMINI_API_KEY')

            if (!apiKey) {
                showToast('error', 'Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file.')
                return
            }

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                        }
                    })
                }
            )

            if (response.status === 429) {
                showToast('error', 'Gemini rate limit reached. Please wait a moment and try again.')
                return
            }

            if (!response.ok) {
                const errData = await response.json()
                showToast('error', errData?.error?.message || 'Failed to generate content.')
                return
            }

            const data = await response.json()
            const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text

            if (!generatedText) {
                showToast('error', 'No content was generated. Please try again.')
                return
            }

            const cleanedText = generatedText
                .replace(/^```html\n?/i, '')
                .replace(/^```\n?/, '')
                .replace(/\n?```$/, '')
                .trim()

            editorRef.current?.setContent(cleanedText)
            form.setValue('blogContent', cleanedText)
            showToast('success', 'AI content generated successfully!')

        } catch (error) {
            showToast('error', 'Something went wrong while generating content.')
            console.error('Gemini API error:', error)
        } finally {
            setAiLoading(false)
        }
    }

    async function onSubmit(values) {
        try {
            const newValues = { ...values, author: user.user._id }
            if (!file) {
                showToast('error', 'Feature image required.')
                return
            }

            const formData = new FormData()
            formData.append('file', file)
            formData.append('data', JSON.stringify(newValues))

            const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/blog/add`, {
                method: 'post',
                credentials: 'include',
                body: formData
            })
            const data = await response.json()
            if (!response.ok) {
                return showToast('error', data.message)
            }
            form.reset()
            setFile()
            setPreview()
            navigate(RouteBlog)
            showToast('success', data.message)
        } catch (error) {
            showToast('error', error.message)
        }
    }

    const handleFileSelection = (files) => {
        const file = files[0]
        const preview = URL.createObjectURL(file)
        setFile(file)
        setPreview(preview)
    }

    return (
        <div>
            <Card className="pt-5">
                <CardContent>
                    <h1 className='text-2xl font-bold mb-4'>Add Blog</h1>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categoryData && categoryData.category.length > 0 &&
                                                            categoryData.category.map(category =>
                                                                <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
                                                            )
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter blog title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Slug" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-3'>
                                <span className='mb-2 block'>Featured Image</span>
                                <Dropzone onDrop={acceptedFiles => handleFileSelection(acceptedFiles)}>
                                    {({ getRootProps, getInputProps }) => (
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <div className='flex justify-center items-center w-36 h-28 border-2 border-dashed rounded'>
                                                <img src={filePreview} />
                                            </div>
                                        </div>
                                    )}
                                </Dropzone>
                            </div>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="blogContent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className='flex justify-between items-center mb-1'>
                                                <FormLabel>Blog Content</FormLabel>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleGenerateWithAI}
                                                    disabled={aiLoading}
                                                    className="flex items-center gap-1 text-purple-600 border-purple-300 hover:bg-purple-50"
                                                >
                                                    {aiLoading
                                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                                        : <><Sparkles className="w-4 h-4" /> Generate with AI</>
                                                    }
                                                </Button>
                                            </div>
                                            <FormControl>
                                                <Editor ref={editorRef} props={{ initialData: '', onChange: handleEditorData }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full">Submit</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default AddBlog
