import { prisma } from "./prisma";

export async function updatePostRating(postId: number) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        postId,
        status: "approved",
      },
      select: {
        rating: true,
      },
    });

    const count = reviews.length;
    const avg = count > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / count 
      : 0;

    await prisma.post.update({
      where: { id: postId },
      data: {
        rating: parseFloat(avg.toFixed(1)),
        reviewCount: count,
      },
    });

    console.log(`[RATINGS] Updated post ${postId}: avg=${avg.toFixed(1)}, count=${count}`);
  } catch (error) {
    console.error(`[RATINGS] Error updating post ${postId}:`, error);
  }
}
