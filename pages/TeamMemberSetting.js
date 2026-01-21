import React, { useState, useRef, useEffect } from "react";
import { MdOutlineFileUpload, MdEdit, MdDelete } from "react-icons/md";
import { IoCloseCircleOutline } from "react-icons/io5";
import Compressor from "compressorjs";
import { Api, ApiFormData } from "@/services/service";
import { useRouter } from "next/router";

const TeamMemberManagement = (props) => {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState([]);
  const [singleMemberImg, setSingleMemberImg] = useState("");
  const [memberName, setMemberName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [memberposition, setMemberposition] = useState([]);
  const fileRef = useRef();

  useEffect(() => {
    getTeamMembers();
  }, []);

  const getTeamMembers = async () => {
    props.loader(true);
    Api("get", "getTeamMembers", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.success) {
          setTeamMembers(res?.team || []);
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileSizeInMb = file.size / (1024 * 1024);
    if (fileSizeInMb > 5) {
      props.toaster({
        type: "error",
        message: "Too large file. Please upload a smaller image",
      });
      return;
    }

    new Compressor(file, {
      quality: 0.6,
      success: (compressedResult) => {
        console.log(compressedResult);
        const data = new FormData();
        data.append("file", compressedResult);
        props.loader(true);
        ApiFormData("post", "user/fileupload", data, router).then(
          (res) => {
            props.loader(false);
            console.log("res================>", res);
            if (res.status) {
              setSingleMemberImg(res.data.file);
              props.toaster({ type: "success", message: res.data.message });
            }
          },
          (err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.message });
          }
        );
      },
    });
  };

  const addTeamMember = () => {
    if (singleMemberImg === "" || memberName === "" || memberposition === "") {
      props.toaster({
        type: "error",
        message: "All items is required",
      });
      return;
    }

    const memberData = {
      memberimage: singleMemberImg,
      membername: memberName,
      memberposition: memberposition,
    };

    props.loader(true);
    Api("post", "createTeamMember", memberData, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.success) {
          getTeamMembers();
          setTeamMembers([...teamMembers, res.data]);
          setSingleMemberImg("");
          setMemberName("");
          setMemberposition("");
          props.toaster({ type: "success", message: res?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const updateTeamMember = (member) => {
    if (singleMemberImg === "" || memberName === "" || memberposition === "") {
      props.toaster({
        type: "error",
        message: "All items is required",
      });
      return;
    }

    const memberData = {
      id: member._id,
      memberimage: singleMemberImg,
      membername: memberName,
      memberposition: memberposition,
    };

    props.loader(true);
    Api("post", "updateTeamMember", memberData, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.success) {
          getTeamMembers();
          const updatedMembers = teamMembers.map((item) =>
            item._id === member._id ? res.team : item
          );
          setTeamMembers(updatedMembers);

          setSingleMemberImg("");
          setMemberName("");
          setMemberposition("");
          setEditingId(null);
          props.toaster({ type: "success", message: res?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const deleteTeamMember = (memberId) => {
    props.loader(true);
    Api("delete", `deleteTeamMember/${memberId}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.success) {
          getTeamMembers();
          props.toaster({ type: "success", message: res?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  //   const deleteTeamMember = (memberId) => {
  //     const updatedMembers = teamMembers.filter(
  //       (member) => member._id !== memberId
  //     );
  //     setTeamMembers(updatedMembers);
  //     props.toaster({
  //       type: "success",
  //       message: "Team member removed successfully",
  //     });
  //   };

  const editTeamMember = (member) => {
    setEditingId(member._id);
    setSingleMemberImg(member.memberimage);
    setMemberName(member.membername);
    setMemberposition(member.memberposition);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSingleMemberImg("");
    setMemberName("");
    setMemberposition("");
  };

  return (
    <div className="mb-8 md:mt-8 mt-6 w-full h-full overflow-y-scroll  scrollbar-hide overflow-scroll pb-32 px-8">
      <h2 className="text-gray-800 font-bold md:text-3xl text-2xl mb-4 flex items-center">
        <span className="w-1 h-8 bg-[#F38529] rounded mr-3"></span>
        Team Member Management
      </h2>

      <section className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="w-full">
          <div className="space-y-6">
            {/* Member Image Input */}
            <div className="relative w-full">
              <label className="text-gray-700 text-lg font-medium mb-2 block">
                Member Image
              </label>
              <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                <input
                  className="outline-none bg-transparent w-full text-gray-700"
                  type="text"
                  placeholder="Enter image URL"
                  value={singleMemberImg}
                  onChange={(e) => setSingleMemberImg(e.target.value)}
                />
                <div
                  className="ml-2 cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors"
                  onClick={() => fileRef.current.click()}
                >
                  <MdOutlineFileUpload className="text-gray-700 h-6 w-6" />
                </div>
                <input
                  type="file"
                  ref={fileRef}
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              {submitted && singleMemberImg === "" && (
                <p className="text-red-600 mt-1 text-sm">
                  Member image is required
                </p>
              )}
            </div>

            {/* Member Name Input */}
            <div className="relative w-full">
              <label className="text-gray-700 text-lg font-medium mb-2 block">
                Member Name
              </label>
              <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white">
                <input
                  className="outline-none bg-transparent w-full text-gray-700"
                  type="text"
                  placeholder="Enter member name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                />
              </div>
              {submitted && memberName === "" && (
                <p className="text-red-600 mt-1 text-sm">
                  Member name is required
                </p>
              )}
            </div>
            <div className="relative w-full">
              <label className="text-gray-700 text-lg font-medium mb-2 block">
                Member Name
              </label>
              <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white">
                <input
                  className="outline-none bg-transparent w-full text-gray-700"
                  type="text"
                  placeholder="Enter member position"
                  value={memberposition}
                  onChange={(e) => setMemberposition(e.target.value)}
                />
              </div>
              {submitted && memberposition === "" && (
                <p className="text-red-600 mt-1 text-sm">
                  Member position is required
                </p>
              )}
            </div>

            {/* Add/Update Button */}
            <div className="flex justify-between items-end gap-4">
              <p className="text-gray-800 text-[14px] md:text-[16px]">
                Please upload member image in 400x400 resolution for best
                results.
              </p>
              <div className="flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    className="text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors rounded-lg text-md py-2.5 px-6 font-medium shadow-sm"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  className="text-white bg-[#F38529] hover:bg-[#e47a1f] transition-colors rounded-lg text-md py-2.5 px-6 font-medium shadow-sm"
                  onClick={() => {
                    if (editingId) {
                      const memberToUpdate = teamMembers.find(
                        (m) => m._id === editingId
                      );
                      updateTeamMember(memberToUpdate);
                    } else {
                      addTeamMember();
                    }
                  }}
                >
                  {editingId ? "Update Member" : "Add Member"}
                </button>
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {teamMembers?.map((member, i) => (
                <div
                  key={i}
                  className="relative group bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#F38529] transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-white mb-3">
                      <img
                        className="w-full h-full object-cover"
                        src={member.memberimage}
                        alt={member.membername}
                      />
                    </div>
                    <h3 className="text-gray-800 font-medium text-center mb-3">
                      {member.membername} ({member.memberposition})
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="bg-[#F38529]  text-white p-2 rounded-md transition-colors"
                        onClick={() => editTeamMember(member)}
                      >
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="bg-[#F38529] text-white p-2 rounded-md transition-colors cursor-pointer"
                        onClick={() => deleteTeamMember(member._id)}
                      >
                        <MdDelete className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {teamMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No team members added yet. Add your first team member above!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamMemberManagement;
