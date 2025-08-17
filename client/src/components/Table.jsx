import clsx from "clsx";
import { useState } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdVisibility,
  MdCalendarToday,
  MdPeople,
  MdAttachment,
  MdFlag
} from "react-icons/md";
import { BiSearch, BiFilter, BiSort } from "react-icons/bi";
import { toast } from "sonner";
import { useTrashTastMutation } from "../redux/slices/api/taskApiSlice.js";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../utils/index.js";
import { AddTask, TaskAssets, TaskColor } from "./tasks";
import { Link } from "react-router-dom";
import Button from "./Button.jsx";
import ConfirmatioDialog from "./ConfirmationDialog.jsx";
import UserInfo from "./UserInfo.jsx";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const PRIORITY_COLORS = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  normal: "text-blue-600 bg-blue-50 border-blue-200",
  low: "text-gray-600 bg-gray-50 border-gray-200"
};

const STAGE_COLORS = {
  todo: "bg-slate-100 text-slate-700",
  "in progress": "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700"
};

const Table = ({ tasks }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDropdown, setShowDropdown] = useState(null);

  const [deleteTask] = useTrashTastMutation();

  const deleteClicks = (id) => {
    setSelected(id);
    setOpenDialog(true);
    setShowDropdown(null);
  };

  const editClickHandler = (el) => {
    setSelected(el);
    setOpenEdit(true);
    setShowDropdown(null);
  };

  const deleteHandler = async () => {
    try {
      const res = await deleteTask({
        id: selected,
        isTrashed: "trash",
      }).unwrap();

      toast.success(res?.message);

      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    ?.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    })
    ?.sort((a, b) => {
      const aVal = sortBy === "date" ? new Date(a.date) : a[sortBy];
      const bVal = sortBy === "date" ? new Date(b.date) : b[sortBy];

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const TableHeader = () => (
    <thead className='bg-gray-50 border-b border-gray-200'>
      <tr className='text-left'>
        <th className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider'>
          <div className="flex items-center gap-2">
            <MdFlag className="text-sm" />
            Task Details
          </div>
        </th>
        <th className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider'>
          <div className="flex items-center gap-2">
            <MdKeyboardDoubleArrowUp className="text-sm" />
            Priority
          </div>
        </th>
        <th className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider'>
          <div className="flex items-center gap-2">
            <MdCalendarToday className="text-sm" />
            Due Date
          </div>
        </th>
        <th className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider'>
          <div className="flex items-center gap-2">
            <MdAttachment className="text-sm" />
            Assets
          </div>
        </th>
        <th className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider'>
          <div className="flex items-center gap-2">
            <MdPeople className="text-sm" />
            Team
          </div>
        </th>
        <th className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider'>
          Actions
        </th>
      </tr>
    </thead>
  );

  const TableRow = ({ task, index }) => (
    <tr className={clsx(
      'border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200',
      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
    )}>
      <td className='px-6 py-4'>
        <Link to={`/task/${task._id}`} className="block hover:no-underline">
          <div className='flex items-start gap-3'>
            <div className="flex-shrink-0 mt-1">
              <TaskColor className={clsx(TASK_TYPE[task.stage], "w-3 h-3 rounded-full")} />
            </div>
            <div className="min-w-0 flex-1">
              <p className='font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-1'>
                {task?.title}
              </p>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                  STAGE_COLORS[task.stage?.toLowerCase()] || "bg-gray-100 text-gray-700"
                )}>
                  {task.stage}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </td>

      <td className='px-6 py-4'>
        <div className={clsx(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border",
          PRIORITY_COLORS[task?.priority] || PRIORITY_COLORS.normal
        )}>
          <span className="text-lg">
            {ICONS[task?.priority]}
          </span>
          <span className='capitalize'>
            {task?.priority}
          </span>
        </div>
      </td>

      <td className='px-6 py-4'>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MdCalendarToday className="text-gray-400" />
          {formatDate(new Date(task?.date))}
        </div>
      </td>

      <td className='px-6 py-4'>
        <TaskAssets
          activities={task?.activities?.length}
          subTasks={task?.subTasks}
          assets={task?.assets?.length}
        />
      </td>

      <td className='px-6 py-4'>
        <div className='flex items-center'>
          {task?.team?.slice(0, 3).map((m, idx) => (
            <div
              key={m._id}
              className={clsx(
                "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm font-medium -ml-2 first:ml-0 hover:z-10 relative transition-transform hover:scale-110",
                BGS[idx % BGS?.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
          {task?.team?.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium -ml-2 hover:z-10 relative">
              +{task.team.length - 3}
            </div>
          )}
        </div>
      </td>

      <td className='px-6 py-4'>
        <div className="flex items-center gap-2">
          <Link
            to={`/task/${task._id}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <MdVisibility className="text-lg" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(showDropdown === task._id ? null : task._id)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <MdMoreVert className="text-lg" />
            </button>

            {showDropdown === task._id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => editClickHandler(task)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  <MdEdit className="text-blue-500" />
                  Edit Task
                </button>
                <button
                  onClick={() => deleteClicks(task._id)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                >
                  <MdDelete className="text-red-500" />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {/* Table Controls */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BiFilter className="text-gray-500" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <BiSort className="text-gray-500" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date-desc">Date (Newest)</option>
                  <option value="date-asc">Date (Oldest)</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="priority-desc">Priority (High-Low)</option>
                  <option value="priority-asc">Priority (Low-High)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredAndSortedTasks?.length || 0} of {tasks?.length || 0} tasks
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <TableHeader />
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTasks?.length > 0 ? (
                filteredAndSortedTasks.map((task, index) => (
                  <TableRow key={task._id} task={task} index={index} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <BiSearch className="text-4xl text-gray-300" />
                      <p className="text-lg font-medium">No tasks found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(null)}
        />
      )}

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <AddTask
        open={openEdit}
        setOpen={setOpenEdit}
        task={selected}
        key={new Date().getTime()}
      />
    </>
  );
};

export default Table;