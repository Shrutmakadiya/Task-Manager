import { Dialog, Transition } from "@headlessui/react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Fragment, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  BiImages,
  BiX,
  BiCalendar,
  BiUser,
  BiFlag,
  BiFile,
  BiLink,
  BiText,
  BiCheck
} from "react-icons/bi";
import { toast } from "sonner";

import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import { dateFormatter } from "../../utils";
import { app } from "../../utils/firebase";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import SelectList from "../SelectList";
import Textbox from "../Textbox";
import UserList from "./UsersSelect";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORITY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

const PRIORITY_COLORS = {
  HIGH: "bg-red-100 text-red-800 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  NORMAL: "bg-blue-100 text-blue-800 border-blue-200",
  LOW: "bg-gray-100 text-gray-800 border-gray-200"
};

const STAGE_COLORS = {
  TODO: "bg-slate-100 text-slate-700 border-slate-200",
  "IN PROGRESS": "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200"
};

const uploadedFileURLs = [];

const uploadFile = async (file) => {
  const storage = getStorage(app);
  const name = new Date().getTime() + file.name;
  const storageRef = ref(storage, name);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log("Uploading");
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            uploadedFileURLs.push(downloadURL);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  });
};

const AddTask = ({ open, setOpen, task }) => {
  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    team: [],
    stage: "",
    priority: "",
    assets: [],
    description: "",
    links: "",
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({ defaultValues });

  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  const [team, setTeam] = useState(task?.team || []);
  const [priority, setPriority] = useState(
    task?.priority?.toUpperCase() || PRIORITY[2]
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const URLS = task?.assets ? [...task.assets] : [];

  const handleOnSubmit = async (data) => {
    if (assets.length > 0) {
      setUploading(true);
      setUploadProgress(0);
    }

    for (const file of assets) {
      try {
        await uploadFile(file);
        setUploadProgress((prev) => prev + (100 / assets.length));
      } catch (error) {
        console.error("Error uploading file:", error.message);
        toast.error("Failed to upload file: " + error.message);
        setUploading(false);
        return;
      }
    }

    setUploading(false);

    try {
      const newData = {
        ...data,
        assets: [...URLS, ...uploadedFileURLs],
        team,
        stage,
        priority,
      };

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

      toast.success(res.message);
      reset();
      setTimeout(() => {
        setOpen(false);
      }, 300);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSelect = (e) => {
    const files = Array.from(e.target.files);
    setAssets(files);
  };

  const removeAsset = (index) => {
    const newAssets = assets.filter((_, i) => i !== index);
    setAssets(newAssets);
  };

  const handleClose = () => {
    reset();
    setAssets([]);
    setUploadProgress(0);
    setOpen(false);
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BiCheck className="text-white text-xl" />
                      </div>
                      {task ? "Update Task" : "Create New Task"}
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <BiX className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-6">
                    {/* Task Title */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <BiText className="text-blue-500" />
                        Task Title
                      </label>
                      <input
                        {...register("title", { required: "Title is required!" })}
                        placeholder="Enter task title..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Team Assignment */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <BiUser className="text-green-500" />
                        Assign Team Members
                      </label>
                      <UserList setTeam={setTeam} team={team} />
                    </div>

                    {/* Stage and Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <BiFlag className="text-orange-500" />
                          Task Stage
                        </label>
                        <div className="relative">
                          <select
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none ${STAGE_COLORS[stage]} font-medium`}
                          >
                            {LISTS.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <BiFlag className="text-red-500" />
                          Priority Level
                        </label>
                        <div className="relative">
                          <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none ${PRIORITY_COLORS[priority]} font-medium`}
                          >
                            {PRIORITY.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Date and Assets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <BiCalendar className="text-purple-500" />
                          Due Date
                        </label>
                        <input
                          {...register("date", { required: "Date is required!" })}
                          type="date"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                        {errors.date && (
                          <p className="text-red-500 text-sm">{errors.date.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <BiFile className="text-indigo-500" />
                          Assets
                        </label>
                        <label
                          htmlFor="imgUpload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                        >
                          <BiImages className="text-blue-500 text-xl" />
                          <span className="text-gray-600 font-medium">
                            {assets.length > 0 ? `${assets.length} files selected` : "Choose files"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            id="imgUpload"
                            onChange={handleSelect}
                            accept=".jpg, .png, .jpeg, .pdf, .doc, .docx"
                            multiple
                          />
                        </label>
                      </div>
                    </div>

                    {/* Selected Assets Preview */}
                    {assets.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Selected Files:</label>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(assets).map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-sm"
                            >
                              <BiFile className="text-gray-500" />
                              <span className="truncate max-w-[150px]">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeAsset(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <BiX />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Uploading files...</span>
                          <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <BiText className="text-gray-500" />
                        Description
                      </label>
                      <textarea
                        {...register("description")}
                        placeholder="Describe the task in detail..."
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                      />
                    </div>

                    {/* Links */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <BiLink className="text-cyan-500" />
                        Related Links
                        <span className="text-xs text-gray-500 font-normal">(separate with commas)</span>
                      </label>
                      <textarea
                        {...register("links")}
                        placeholder="https://example.com, https://docs.example.com"
                        rows="2"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || isUpdating || uploading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {isLoading || isUpdating || uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            {uploading ? "Uploading..." : task ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>
                            <BiCheck />
                            {task ? "Update Task" : "Create Task"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddTask;