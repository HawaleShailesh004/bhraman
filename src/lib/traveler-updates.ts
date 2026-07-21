import "server-only";

import { prisma } from "@/lib/prisma";

export type TravelerUpdateFeedItem = {
  id: string;
  bookingRef: string;
  listingTitle: string;
  departureAt: string;
  slotStatus: string;
  update: {
    id: string;
    title: string;
    body: string;
    type: string;
    pinned: boolean;
    createdAt: string;
  };
  isUnread: boolean;
};

export async function getTravelerUpdatesFeed(
  userId: string,
): Promise<TravelerUpdateFeedItem[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] },
    },
    include: {
      updateRead: true,
      slot: {
        include: {
          updates: { orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] },
        },
      },
    },
    orderBy: { startTimeSnapshot: "asc" },
  });

  const items: TravelerUpdateFeedItem[] = [];
  for (const booking of bookings) {
    for (const update of booking.slot.updates) {
      const lastRead = booking.updateRead?.lastReadAt;
      items.push({
        id: `${booking.id}-${update.id}`,
        bookingRef: booking.bookingRef,
        listingTitle: booking.listingTitleSnapshot,
        departureAt: booking.startTimeSnapshot.toISOString(),
        slotStatus: booking.slot.status,
        update: {
          id: update.id,
          title: update.title,
          body: update.body,
          type: update.type,
          pinned: update.pinned,
          createdAt: update.createdAt.toISOString(),
        },
        isUnread: !lastRead || update.createdAt > lastRead,
      });
    }
  }

  return items.sort(
    (a, b) =>
      new Date(b.update.createdAt).getTime() -
      new Date(a.update.createdAt).getTime(),
  );
}

export async function countUnreadTravelerUpdates(userId: string) {
  const feed = await getTravelerUpdatesFeed(userId);
  return feed.filter((item) => item.isUnread).length;
}
