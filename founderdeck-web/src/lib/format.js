import { mediaUrl } from '../utils/mediaUrl';

export const formatStage = (value) => {
  if (!value) return 'Idea';
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const numberCompact = (value = 0) => new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
}).format(value ?? 0);

export const initials = (name = 'FD') => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((word) => word[0]?.toUpperCase())
  .join('') || 'FD';

export const getPostImage = (post) => mediaUrl(post?.cover_image_url) || null;
