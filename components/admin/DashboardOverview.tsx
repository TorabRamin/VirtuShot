import React from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { KeyIcon } from '../icons/KeyIcon';
import type { ClientUser } from '../../types';
import type { ApiUsageLog } from '../../pages/AdminPage';

interface DashboardOverviewProps {
    clients: ClientUser[];
    usageLogs: ApiUsageLog[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-3">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
};


export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ clients, usageLogs }) => {
    const totalImagesGenerated = usageLogs.length;
    const activeClients = clients.filter(c => c.status === 'active').length;

    const apiCallsToday = usageLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return logDate > yesterday;
    }).length;

    const combinedActivity = [
        ...usageLogs.map(log => ({
            type: 'generation' as const,
            timestamp: new Date(log.timestamp),
            data: {
                ...log,
                clientName: clients.find(c => c.id === log.clientId)?.name || 'Unknown Client'
            }
        })),
        ...clients.map(client => ({
            type: 'new_client' as const,
            timestamp: new Date(client.createdAt),
            data: client
        }))
    ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 7);


    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Images Generated" value={totalImagesGenerated.toLocaleString()} icon={<SparklesIcon className="w-6 h-6" />} />
                <StatCard title="Active API Clients" value={activeClients.toLocaleString()} icon={<UsersIcon className="w-6 h-6" />} />
                <StatCard title="API Calls Today" value={apiCallsToday.toLocaleString()} icon={<KeyIcon className="w-6 h-6" />} />
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg">
                     {combinedActivity.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {combinedActivity.map((activity) => (
                                <li key={`${activity.type}-${activity.data.id}`} className="p-4 flex items-center gap-4">
                                    {activity.type === 'generation' ? (
                                        <>
                                            <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                                                <SparklesIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-700 truncate">
                                                    <span className="font-semibold">{activity.data.clientName}</span> generated an image.
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">"{activity.data.promptSummary}"</p>
                                            </div>
                                            <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{timeSince(activity.timestamp)}</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-green-100 text-green-600 rounded-full p-2 flex-shrink-0">
                                                <UsersIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-700 truncate">
                                                    New client <span className="font-semibold">{activity.data.name}</span> joined.
                                                </p>
                                            </div>
                                            <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{timeSince(activity.timestamp)}</span>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 text-center p-8">No recent activity to show.</p>
                    )}
                </div>
            </div>
        </div>
    );
};