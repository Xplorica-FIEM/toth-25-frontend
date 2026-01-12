import React from 'react';
import Link from "next/link";
import { Compass, Shield, LogOut } from "lucide-react";

const Navbar = ({ user, handleLogout, showProfileMenu, setShowProfileMenu, profileMenuRef }) => (
  <nav className="relative z-50 bg-linear-to-r from-stone-900/95 to-amber-950/95 backdrop-blur-md border-b border-amber-700/30">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 animate-spin-slow" />
          <h1 className="text-amber-100 text-base sm:text-lg font-bold">Trails of the Hunt</h1>
        </div>
        <div className="relative" ref={profileMenuRef}>
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-700/50 rounded-lg px-2.5 py-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-amber-600 to-amber-800 flex items-center justify-center border-2 border-amber-500/50">
              <span className="text-white font-bold">{user?.fullName?.charAt(0)?.toUpperCase()}</span>
            </div>
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-stone-900/98 backdrop-blur-lg border border-amber-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="bg-linear-to-br from-amber-900/60 to-amber-950/60 p-4 border-b border-amber-700/30">
                <div className="mb-4">
                  <p className="text-amber-100 font-bold text-lg leading-tight truncate">{user?.fullName}</p>
                  <p className="text-amber-200/60 text-xs font-medium truncate mt-0.5">{user?.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-black/20 rounded-lg p-3 border border-amber-500/10">
                  {user?.phoneNumber && (
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-amber-500/60 text-[10px] uppercase font-bold tracking-wider mb-0.5">Mobile</p>
                      <p className="text-amber-100 text-sm font-medium truncate">{user?.phoneNumber}</p>
                    </div>
                  )}
                  {user?.classRollNo && (
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-amber-500/60 text-[10px] uppercase font-bold tracking-wider mb-0.5">Roll No</p>
                      <p className="text-amber-100 text-sm font-medium truncate">{user?.classRollNo}</p>
                    </div>
                  )}
                  {user?.department && (
                    <div className="col-span-2 border-t border-amber-500/10 pt-2 mt-1">
                      <p className="text-amber-500/60 text-[10px] uppercase font-bold tracking-wider mb-0.5">Department</p>
                      <p className="text-amber-100 text-sm font-medium truncate">{user?.department}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-2">
                {user?.isAdmin && (
                  <Link href="/admin/dashboard">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-purple-200 hover:bg-purple-900/40 rounded-lg transition-colors">
                      <Shield className="w-4 h-4" /> <span>Admin Center</span>
                    </button>
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-200 hover:bg-red-900/40 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" /> <span>Abandon Quest</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;