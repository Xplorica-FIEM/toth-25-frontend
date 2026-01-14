
import React from 'react';

const UserScanStats = ({ data }) => {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-amber-100 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        Top Scanners
      </h3>
      
      <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-700 text-stone-400 text-xs uppercase tracking-wider">
              <th className="pb-3 px-2">User</th>
              <th className="pb-3 px-2 text-right">Unique</th>
              <th className="pb-3 px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {data.map((user, idx) => (
              <tr key={user.userId} className="hover:bg-stone-800/50 transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${idx === 0 ? 'bg-yellow-500 text-stone-900' : 
                          idx === 1 ? 'bg-stone-400 text-stone-900' : 
                          idx === 2 ? 'bg-orange-700 text-white' : 'bg-stone-800 text-stone-500'}
                    `}>
                        {idx + 1}
                    </div>
                    <div>
                        <div className="text-amber-100 text-sm font-medium">{user.userName}</div>
                        <div className="text-stone-500 text-xs truncate max-w-[150px]">{user.userEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-right text-amber-400 font-bold text-sm">
                  {user.uniqueScans}
                </td>
                <td className="py-3 px-2 text-right text-stone-400 text-sm">
                  {user.totalScans}
                </td>
              </tr>
            ))}
             {data.length === 0 && (
                <tr>
                    <td colSpan="3" className="text-stone-500 text-center py-4">No user data</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserScanStats;
