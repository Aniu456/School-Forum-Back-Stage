/**
 * 头像工具函数
 * 与用户端保持一致，使用 ui-avatars.com 作为兜底头像服务。
 */

/** 生成默认头像 URL（基于用户名首字母 + 随机背景色） */
export function getDefaultAvatar(name: string, size = 200): string {
  const encodedName = encodeURIComponent(name || 'User')
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=random&color=fff&bold=true`
}

/**
 * 获取头像 URL：优先使用用户自定义头像，否则返回默认头像
 * 用于 antd <Avatar src={...} />，避免新注册用户头像字段为空时
 * 只显示灰色圆圈。
 */
export function getAvatarSrc(name?: string, avatar?: string | null, size = 200): string {
  if (avatar && avatar.trim()) return avatar
  return getDefaultAvatar(name || 'User', size)
}
