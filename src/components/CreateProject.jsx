import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { createProject } from '../services/blockchain'
import { useGlobalState, setGlobalState } from '../store'

const CreateProject = () => {
  const [createModal] = useGlobalState('createModal')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState('')
  const [docLink, setDocLink] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [loading, setLoading] = useState(false)

  const toTimestamp = (dateStr) => Date.parse(dateStr) / 1000

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description || !cost || !date || !imageURL) return

    setLoading(true)

    const params = {
      title,
      description: `${description}\n\nDocument Link: ${docLink}`,
      cost,
      expiresAt: toTimestamp(date),
      imageURL,
    }

    try {
      await createProject(params)
      toast.success('Project created successfully.')
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const onClose = () => {
    setGlobalState('createModal', 'scale-0')
    reset()
  }

  const reset = () => {
    setTitle('')
    setCost('')
    setDescription('')
    setImageURL('')
    setDate('')
    setDocLink('')
  }

  return (
    <div className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 transform transition-transform duration-300 ${createModal}`}>
      <div className="bg-white shadow-xl shadow-black rounded-xl w-11/12 md:w-2/5 h-7/12 p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Add Project</p>
            <button onClick={onClose} type="button" className="border-0 bg-transparent focus:outline-none">
              <FaTimes />
            </button>
          </div>

          <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-transparent focus:outline-none text-sm"
              required
            />
          </div>

          <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
            <input
              type="number"
              placeholder="Cost (ETH)"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              step="0.01"
              min="0.01"
              className="w-full p-2 bg-transparent focus:outline-none text-sm"
              required
            />
          </div>

          <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-transparent focus:outline-none text-sm"
              required
            />
          </div>

          <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
            <input
              type="url"
              placeholder="Image URL"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
              className="w-full p-2 bg-transparent focus:outline-none text-sm"
              required
            />
          </div>

          <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-transparent focus:outline-none text-sm"
              required
            />
          </div>

          <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
            <input
              type="url"
              placeholder="Google Drive or Document Link (optional)"
              value={docLink}
              onChange={(e) => setDocLink(e.target.value)}
              className="w-full p-2 bg-transparent focus:outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-full mt-5 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Project'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateProject
