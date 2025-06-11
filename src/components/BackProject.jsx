import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { backProject } from '../services/blockchain'
import { useGlobalState, setGlobalState } from '../store'

const BackProject = ({ project }) => {
  const [backModal] = useGlobalState('backModal')
  const [amount, setAmount] = useState('')
  const [isBacking, setIsBacking] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount) return

    try {
      setIsBacking(true)
      await backProject(project?.id, amount)
      toast.success('Thank you for backing! It will reflect in 30 sec.')
      setGlobalState('backModal', 'scale-0')
    } catch (error) {
      toast.error('Failed to back project. Please try again.')
    } finally {
      setIsBacking(false)
    }
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex
    items-center justify-center bg-black bg-opacity-50
    transform transition-transform duration-300 ${backModal}`}
    >
      <div
        className="bg-white shadow-xl shadow-black
        rounded-xl w-11/12 md:w-2/5 h-7/12 p-6"
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-between items-center">
            <p className="font-semibold">{project?.title}</p>
            <button
              onClick={() => setGlobalState('backModal', 'scale-0')}
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

          <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
            <input
              className="block w-full bg-transparent border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
              type="number"
              step={0.01}
              min={0.01}
              name="amount"
              placeholder="Amount (ETH)"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              required
              disabled={isBacking}
            />
          </div>

          <button
            type="submit"
            disabled={isBacking}
            className={`inline-block px-6 py-2.5 ${
              isBacking ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium text-md leading-tight
            rounded-full shadow-md mt-5 flex justify-center items-center`}
          >
            {isBacking ? (
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
                Backing in progress... Thank you! 💚
              </>
            ) : (
              'Back Project'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BackProject
