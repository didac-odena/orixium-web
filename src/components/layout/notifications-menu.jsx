import { useEffect, useState } from "react";
import { EnvelopeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { HeaderDropdown } from "../ui";
import { NOTIFICATION_SAMPLES } from "../../mocks/fixtures/notification-samples";

export default function NotificationsMenu({ isActive }) {
    const [notifications, setNotifications] = useState([]);
    const hasNotifications = notifications.length > 0;
    const iconClassName = hasNotifications ? "text-danger" : "text-ink";

    const menuClassName = "w-full min-w-72";

    const renderEmptyState = () => {
        return (
            <div className="px-4 py-2 text-xs text-muted">
                No notifications yet.
            </div>
        );
    };

    const renderNotificationItem = (notification) => {
        const handleRemoveClick = () => {
            setNotifications((prevNotifications) => {
                return prevNotifications.filter((item) => {
                    return item.id !== notification.id;
                });
            });
        };

        return (
            <div
                key={notification.id}
                className="flex items-start justify-between gap-3 px-4 py-2"
            >
                <div className="text-xs text-ink">
                    <div className="font-medium text-ink">
                        {notification.title}
                    </div>
                    <div className="text-muted">{notification.message}</div>
                    {notification.timestamp ? (
                        <div className="text-2sx text-muted">
                            {notification.timestamp}
                        </div>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={handleRemoveClick}
                    className="text-muted hover:text-accent-2"
                    aria-label="Remove notification"
                >
                    <TrashIcon className="h-4 w-4 hover:text-accent-2" aria-hidden="true" />
                </button>
            </div>
        );
    };

    const buildMockNotification = () => {
        const sample =
            NOTIFICATION_SAMPLES[
                Math.floor(Math.random() * NOTIFICATION_SAMPLES.length)
            ];

        return {
            id: crypto.randomUUID(),
            title: sample.title,
            message: sample.message,
            timestamp: new Date().toLocaleTimeString(),
        };
    };

    useEffect(() => {
        if (!isActive) {
            setNotifications([]);
            return;
        }

        const intervalId = setInterval(() => {
            setNotifications((prevNotifications) => {
                const nextNotification = buildMockNotification();
                return [nextNotification, ...prevNotifications];
            });
        }, 5000);

        return () => clearInterval(intervalId);
    }, [isActive]);

    return (
        <HeaderDropdown
            label={
                <EnvelopeIcon
                    className={`h-5 w-5 ${iconClassName}`}
                    aria-hidden="true"
                />
            }
            align="right"
            wrapperClassName="h-16 flex items-center"
            buttonClassName="cursor-pointer h-16 flex items-center px-1"
            menuClassName={menuClassName}
        >
            <div className="max-h-72 overflow-y-auto">
                {hasNotifications
                    ? notifications.map(renderNotificationItem)
                    : renderEmptyState()}
            </div>
        </HeaderDropdown>
    );
}
