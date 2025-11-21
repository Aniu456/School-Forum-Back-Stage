export type UserStatus = 'active' | 'banned'
export type PostStatus = 'normal' | 'pinned' | 'hidden'
export type CommentStatus = 'visible' | 'removed'
export type AnnouncementStatus = 'draft' | 'published'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'student' | 'teacher' | 'admin'
  joinedAt: string
  lastActive: string
  status: UserStatus
  posts: number
  comments: number
  followers: number
  bio: string
  tags: string[]
}

export interface Post {
  id: string
  title: string
  author: string
  authorId: string
  category: string
  tags: string[]
  status: PostStatus
  views: number
  comments: number
  createdAt: string
  heat: number
  summary: string
}

export interface Comment {
  id: string
  postId: string
  postTitle: string
  author: string
  authorId: string
  content: string
  createdAt: string
  likes: number
  status: CommentStatus
}

export interface Announcement {
  id: string
  title: string
  content: string
  status: AnnouncementStatus
  pinned: boolean
  hidden: boolean
  createdAt: string
  updatedAt: string
}
