// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  timestamp?: string
  statusCode?: number
  message?: string
  path?: string
  method?: string
}

// Pagination
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// User types
export type UserRole = 'USER' | 'ADMIN'
export type UserStatus = 'active' | 'banned'

export interface User {
  id: string
  username: string
  email: string
  nickname: string
  avatar: string
  role: UserRole
  isActive: boolean
  isBanned: boolean
  canPost?: boolean
  canComment?: boolean
  bio?: string
  website?: string
  lastLoginAt?: string
  followerCount: number
  followingCount: number
  createdAt: string
  postCount: number
  commentCount: number
}

export interface UserListParams {
  page?: number
  limit?: number
  role?: UserRole
  isBanned?: boolean
  keyword?: string
}

export interface UserLoginHistory {
  id: string
  userId?: string
  loginIp?: string
  loginTime?: string
  userAgent?: string
  device?: string
  location?: string
  ipAddress?: string
  createdAt?: string
}

// Post types
export type PostStatus = 'normal' | 'pinned' | 'hidden'

export interface Post {
  id: string
  title: string
  content?: string
  author: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  isHighlighted: boolean
  isLocked: boolean
  isHidden: boolean
  createdAt: string
  updatedAt?: string
  tags?: string[]
}

export interface PostListParams {
  page?: number
  limit?: number
  isPinned?: boolean
  isHighlighted?: boolean
  isHidden?: boolean
  keyword?: string
  postId?: string
  authorId?: string
  tag?: string
  sortBy?: 'createdAt' | 'hot'
  order?: 'asc' | 'desc'
}

// Comment types
export type CommentStatus = 'visible' | 'removed'

export interface Comment {
  id: string
  postId: string
  postTitle?: string
  post?: {
    id: string
    title: string
  }
  author: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
  content: string
  createdAt: string
  likeCount: number
}

export interface CommentListParams {
  page?: number
  limit?: number
  keyword?: string
  authorId?: string
  postId?: string
}

// Announcement types
export type AnnouncementType = 'INFO' | 'WARNING' | 'URGENT'
export type AnnouncementTargetRole = 'USER' | 'ADMIN' | null
export type AnnouncementStatus = 'draft' | 'published'

export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  targetRole: AnnouncementTargetRole
  isPinned: boolean
  isHidden?: boolean
  isPublished?: boolean
  publishedAt?: string
  createdAt: string
  updatedAt?: string
  author?: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
}

export interface AnnouncementInput {
  title: string
  content: string
  type?: AnnouncementType
  targetRole?: AnnouncementTargetRole
  isPinned?: boolean
  isPublished?: boolean
  isHidden?: boolean
}

// Statistics
export interface SystemStatistics {
  users: {
    total: number
    active: number
    banned: number
  }
  posts: {
    total: number
  }
  comments: {
    total: number
  }
}

// Authentication
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    username: string
    email: string
    nickname: string
    avatar: string
    role: string
  }
}

export interface AdminRegisterPayload {
  email: string
  username: string
  password: string
  adminKey: string
  nickname?: string
}
