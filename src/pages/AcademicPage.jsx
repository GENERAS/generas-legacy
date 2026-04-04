import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FaFilePdf, FaAward, FaImages, FaBook, FaCalendar, FaSchool, FaDownload, FaLock, FaLink, FaTimes } from 'react-icons/fa'
import LikeButton from '../components/likes/LikeButton'
import CommentsSection from '../components/comments/CommentsSection'

export default function AcademicPage() {
  const [levels, setLevels] = useState([])
  const [documents, setDocuments] = useState({})
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDocs, setSelectedDocs] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedCert, setSelectedCert] = useState(null) // For lightbox

  useEffect(() => {
    loadAcademicData()
    loadCertificates()
    
    // Set up real-time subscriptions for academic content
    const channel = supabase
      .channel('academic-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'academic_levels' },
        (payload) => {
          console.log('Academic levels changed:', payload)
          loadAcademicData()
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'academic_documents' },
        (payload) => {
          console.log('Academic documents changed:', payload)
          loadAcademicData()
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'certificates' },
        (payload) => {
          console.log('Certificates changed:', payload)
          loadCertificates()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadAcademicData = async () => {
    try {
      // Load all academic levels
      const { data: levelsData } = await supabase
        .from('academic_levels')
        .select('*')
        .order('display_order')

      if (levelsData) {
        setLevels(levelsData)
        
        // Load documents for each level
        const docsMap = {}
        for (const level of levelsData) {
          const { data: docsData } = await supabase
            .from('academic_documents')
            .select('*')
            .eq('level_id', level.id)
          
          docsMap[level.id] = docsData || []
        }
        setDocuments(docsMap)
      }
    } catch (error) {
      console.error('Error loading academic data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCertificates = async () => {
    try {
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .order('issue_date', { ascending: false })
      
      setCertificates(data || [])
    } catch (error) {
      console.error('Error loading certificates:', error)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-900 text-green-300',
      building: 'bg-amber-900 text-amber-300',
      planned: 'bg-blue-900 text-blue-300'
    }
    const labels = {
      completed: '✓ Completed',
      building: '🚧 In Progress',
      planned: '📅 Planned'
    }
    return (
      <span className={`ml-3 px-2 py-1 rounded-full text-xs ${badges[status] || badges.planned}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getDocumentCounts = (levelId) => {
    const docs = documents[levelId] || []
    return {
      reports: docs.filter(d => d.document_type === 'report').length,
      certificates: docs.filter(d => d.document_type === 'certificate').length,
      photos: docs.filter(d => d.document_type === 'photo').length,
      books: docs.filter(d => d.document_type === 'book').length
    }
  }

  const openDocumentViewer = (docs, type) => {
    setSelectedDocs({ docs, type })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Academic Journey
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          From Nursery School to PhD - A complete timeline of my education, achievements, and growth
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-600"></div>

        {levels.map((level) => {
          const counts = getDocumentCounts(level.id)
          
          return (
            <div key={level.id} className="relative mb-12">
              {/* Timeline dot */}
              <div className="absolute -left-8 top-2 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-900"></div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 ml-4 border border-slate-700">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center flex-wrap">
                      {level.level_name}
                      {getStatusBadge(level.status)}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                      <FaSchool className="text-blue-400" />
                      <span>{level.school_name}</span>
                      <span>•</span>
                      <FaCalendar className="text-amber-400" />
                      <span>{level.start_year} - {level.end_year}</span>
                    </div>
                  </div>
                </div>

                {level.description && (
                  <p className="text-gray-300 mb-4">{level.description}</p>
                )}

                {/* Document counters - CLICKABLE */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {counts.reports > 0 && (
                    <button
                      onClick={() => openDocumentViewer(documents[level.id]?.filter(d => d.document_type === 'report'), 'Reports')}
                      className="bg-slate-700/50 rounded-lg p-3 text-center hover:bg-slate-700 transition"
                    >
                      <FaFilePdf className="text-red-400 text-xl mx-auto mb-1" />
                      <div className="text-sm font-semibold">{counts.reports} Reports</div>
                      <div className="text-xs text-gray-400">Click to view</div>
                    </button>
                  )}
                  
                  {counts.certificates > 0 && (
                    <button
                      onClick={() => openDocumentViewer(documents[level.id]?.filter(d => d.document_type === 'certificate'), 'Certificates')}
                      className="bg-slate-700/50 rounded-lg p-3 text-center hover:bg-slate-700 transition"
                    >
                      <FaAward className="text-amber-400 text-xl mx-auto mb-1" />
                      <div className="text-sm font-semibold">{counts.certificates} Certificates</div>
                      <div className="text-xs text-gray-400">Click to view</div>
                    </button>
                  )}
                  
                  {counts.photos > 0 && (
                    <button
                      onClick={() => openDocumentViewer(documents[level.id]?.filter(d => d.document_type === 'photo'), 'Photos')}
                      className="bg-slate-700/50 rounded-lg p-3 text-center hover:bg-slate-700 transition"
                    >
                      <FaImages className="text-green-400 text-xl mx-auto mb-1" />
                      <div className="text-sm font-semibold">{counts.photos} Photos</div>
                      <div className="text-xs text-gray-400">Click to view</div>
                    </button>
                  )}
                  
                  {counts.books > 0 && (
                    <button
                      onClick={() => openDocumentViewer(documents[level.id]?.filter(d => d.document_type === 'book'), 'Books')}
                      className="bg-slate-700/50 rounded-lg p-3 text-center hover:bg-slate-700 transition"
                    >
                      <FaBook className="text-blue-400 text-xl mx-auto mb-1" />
                      <div className="text-sm font-semibold">{counts.books} Books</div>
                      <div className="text-xs text-gray-400">Click to view</div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Certificates Section with Lightbox and Comments */}
      {certificates.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaAward className="text-amber-500" />
            My Certificates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-amber-500/50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedCert(cert)}>
                    <h3 className="font-bold text-lg">{cert.title}</h3>
                    <p className="text-sm text-gray-400">{cert.issuer}</p>
                    {cert.issue_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        📅 Issued: {new Date(cert.issue_date).toLocaleDateString()}
                      </p>
                    )}
                    {cert.credential_id && (
                      <p className="text-xs text-gray-500">
                        🔑 ID: {cert.credential_id}
                      </p>
                    )}
                    <div className="flex gap-3 mt-3">
                      {cert.certificate_url && (
                        <a
                          href={cert.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Certificate →
                        </a>
                      )}
                      {cert.verification_url && (
                        <a
                          href={cert.verification_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaLink /> Verify
                        </a>
                      )}
                    </div>
                  </div>
                  <LikeButton contentType="certificate" contentId={cert.id} initialLikes={cert.likes || 0} />
                </div>
                
                {/* Comments Section for each certificate */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <CommentsSection contentType="certificate" contentId={cert.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Lightbox Modal */}
      {selectedCert && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCert(null)}
        >
          <button 
            onClick={() => setSelectedCert(null)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition z-10"
          >
            <FaTimes />
          </button>
          <div className="max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {selectedCert.certificate_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img 
                src={selectedCert.certificate_url} 
                alt={selectedCert.title}
                className="max-w-full max-h-[85vh] object-contain mx-auto"
              />
            ) : (
              <iframe 
                src={selectedCert.certificate_url} 
                className="w-full h-[80vh] rounded-lg"
                title={selectedCert.title}
              />
            )}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{selectedCert.title}</h3>
              <p className="text-gray-400">{selectedCert.issuer}</p>
              {selectedCert.issue_date && (
                <p className="text-sm text-gray-500 mt-1">
                  Issued: {new Date(selectedCert.issue_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showModal && selectedDocs && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedDocs.type}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              {selectedDocs.docs?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No documents found.</p>
              ) : (
                selectedDocs.docs?.map((doc, index) => (
                  <div key={doc.id || index} className="bg-slate-700/30 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-gray-400">{doc.upload_date || 'No date'}</p>
                    </div>
                    <div className="flex gap-2">
                      {doc.is_premium && <FaLock className="text-amber-500" title="Premium content" />}
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                        >
                          <FaDownload /> View
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}