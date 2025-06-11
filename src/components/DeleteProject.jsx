import { FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { deleteProject } from '../services/blockchain'
import { useGlobalState, setGlobalState } from '../store'
import { useState } from 'react'

const DeleteProject = ({ project }) => {
  const [deleteModal] = useGlobalState('deleteModal')
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(project?.id)
      toast.success('Project deleted successfully, will reflect in 30sec.')
      setGlobalState('deleteModal', 'scale-0')
      navigate('/')
    } catch (error) {
      toast.error('Failed to delete project. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex
    items-center justify-center bg-black bg-opacity-50
    transform transition-transform duration-300 ${deleteModal}`}
    >
      <div
        className="bg-white shadow-xl shadow-black
        rounded-xl w-11/12 md:w-2/5 h-7/12 p-6"
      >
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <p className="font-semibold">{project?.title}</p>
            <button
              onClick={() => setGlobalState('deleteModal', 'scale-0')}
              type="button"
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex justify-center items-center mt-5">
            <div className="rounded-xl overflow-hidden h-20 w-20">
              <img
                src={
                  project?.imageURL ||
                  'https://media.wired.com/photos/5926e64caf95806129f50fde/master/pass/AnkiHP.jpg'
                }
                alt={project?.title}
                className="h-full w-full object-cover cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center items-center rounded-xl mt-5">
            <p>Are you sure?</p>
            <small className="text-red-400">This action cannot be undone!</small>
          </div>

          <button
            disabled={isDeleting}
            className={`inline-block px-6 py-2.5 ${
              isDeleting ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'
            } text-white font-medium text-md leading-tight
            rounded-full shadow-md mt-5 flex justify-center items-center`}
            onClick={handleSubmit}
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Vanishing your project...
              </>
            ) : (
              'Delete Project'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteProject
