import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  FaFilePdf, FaAward, FaImages, FaBook, FaCalendar, FaSchool, 
  FaDownload, FaLock, FaLink, FaTimes, FaEye, FaUserTie, FaFileAlt 
} from 'react-icons/fa'
import LikeButton from '../components/likes/LikeButton'
import CommentsSection from '../components/comments/CommentsSection'

export default function AcademicPage() {
  const [levels, setLevels] = useState([])
  const [documents, setDocuments] = useState({})
  const [reports, setReports] = useState({})
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDocs, setSelectedDocs] = useState(null)
  const [showDocModal, setShowDocModal] = useState(false)
  const [selectedCert, setSelectedCert] = useState(null)
  
  // Level detail modal state
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [viewingFile, setViewingFile] = useState(null)

  useEffect(() => {
    loadAcademicData()
    loadCertificates()
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel('academic-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'academic_levels' },
        () => loadAcademicData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'academic_documents' },
        () => loadAcademicData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'academic_level_reports' },
        () => loadAcademicData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'certificates' },
        () => loadCertificates()
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
        const reportsMap = {}
        
        for (const level of levelsData) {
          // Load academic_documents
          const { data: docsData } = await supabase
            .from('academic_documents')
            .select('*')
            .eq('level_id', level.id)
          docsMap[level.id] = docsData || []
          
          // Load academic_level_reports
          const { data: reportsData } = await supabase
            .from('academic_level_reports')
            .select('*')
            .eq('level_id', level.id)
            .order('display_order')
          reportsMap[level.id] = reportsData || []
        }
        
        setDocuments(docsMap)
        setReports(reportsMap)
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

  const getLevelReportCounts = (levelId) => {
    const levelReports = reports[levelId] || []
    return {
      schoolReports: levelReports.filter(r => r.report_type === 'school_report').length,
      uniformPhotos: levelReports.filter(r => r.report_type === 'uniform_photo').length,
      schoolPhotos: levelReports.filter(r => r.report_type === 'school_photo').length,
      total: levelReports.length
    }
  }

  const openDocumentViewer = (docs, type) => {
    setSelectedDocs({ docs, type })
    setShowDocModal(true)
  }

  const openLevelModal = (level) => {
    setSelectedLevel(level)
    setShowLevelModal(true)
  }

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'school_report': return <FaFileAlt className="text-red-400" />
      case 'uniform_photo': return <FaUserTie className="text-blue-400" />
      case 'school_photo': return <FaImages className="text-green-400" />
      default: return <FaFileAlt className="text-gray-400" />
    }
  }

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'school_report': return 'School Report'
      case 'uniform_photo': return 'Uniform Photo'
      case 'school_photo': return 'School Photo'
      default: return type.replace('_', ' ')
    }
  }

  const viewFile = (report) => {
    setViewingFile(report)
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
          const docCounts = getDocumentCounts(level.id)
          const reportCounts = getLevelReportCounts(level.id)
          
          return (
            <div key={level.id} className="relative mb-12">
              {/* Timeline dot */}
              <div className="absolute -left-8 top-2 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-900"></div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 ml-4 border border-slate-700 hover:border-slate-600 transition">
                <div 
                  className="flex flex-wrap justify-between items-start mb-4 cursor-pointer"
                  onClick={() => openLevelModal(level)}
                >
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold flex items-center flex-wrap hover:text-blue-400 transition">
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
                  <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm mt-2 md:mt-0">
                    <FaEye /> View Details
                  </button>
                </div>

                {level.description && (
                  <p className="text-gray-300 mb-4">{level.description}</p>
                )}

                {/* Combined Document & Report counters */}
                <div className="flex flex-wrap gap-2">
                  {/* Legacy document counters */}
                  {docCounts.reports > 0 && (
                    <button
                      onClick={() => openDocumentViewer(documents[level.id]?.filter(d => d.document_type === 'report'), 'Reports')}
                      className="bg-slate-700/50 rounded-lg px-3 py-2 text-center hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      <FaFilePdf className="text-red-400" />
                      <span className="text-sm">{docCounts.reports} Reports</span>
                    </button>
                  )}
                  
                  {docCounts.certificates > 0 && (
                    <button
                      onClick={() => openDocumentViewer(documents[level.id]?.filter(d => d.document_type === 'certificate'), 'Certificates')}
                      className="bg-slate-700/50 rounded-lg px-3 py-2 text-center hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      <FaAward className="text-amber-400" />
                      <span className="text-sm">{docCounts.certificates} Certs</span>
                    </button>
                  )}

                  {/* New report/photo counters */}
                  {reportCounts.schoolReports > 0 && (
                    <button
                      onClick={() => openLevelModal(level)}
                      className="bg-slate-700/50 rounded-lg px-3 py-2 text-center hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      <FaFileAlt className="text-red-400" />
                      <span className="text-sm">{reportCounts.schoolReports} School Reports</span>
                    </button>
                  )}
                  
                  {reportCounts.uniformPhotos > 0 && (
                    <button
                      onClick={() => openLevelModal(level)}
                      className="bg-slate-700/50 rounded-lg px-3 py-2 text-center hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      <FaUserTie className="text-blue-400" />
                      <span className="text-sm">{reportCounts.uniformPhotos} Uniform Photos</span>
                    </button>
                  )}
                  
                  {reportCounts.schoolPhotos > 0 && (
                    <button
                      onClick={() => openLevelModal(level)}
                      className="bg-slate-700/50 rounded-lg px-3 py-2 text-center hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      <FaImages className="text-green-400" />
                      <span className="text-sm">{reportCounts.schoolPhotos} School Photos</span>
                    </button>
                  )}
                  
                  {reportCounts.total > 0 && (
                    <button
                      onClick={() => openLevelModal(level)}
                      className="bg-blue-600/30 hover:bg-blue-600/50 rounded-lg px-3 py-2 text-center transition flex items-center gap-2"
                    >
                      <FaEye className="text-blue-400" />
                      <span className="text-sm">View All ({reportCounts.total})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Certificates Section */}
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
                    </div>
                  </div>
                  <LikeButton contentType="certificate" contentId={cert.id} initialLikes={cert.likes || 0} />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <CommentsSection contentType="certificate" contentId={cert.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== LEVEL DETAIL MODAL (Two Column Layout) ====== */}
      {showLevelModal && selectedLevel && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLevelModal(false)}
        >
          <div 
            className="bg-slate-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  {selectedLevel.level_name}
                  {selectedLevel.status === 'completed' && <span className="text-green-400 text-lg">✓</span>}
                </h3>
                <p className="text-gray-400 text-sm">
                  {selectedLevel.school_name} • {selectedLevel.start_year} - {selectedLevel.end_year}
                </p>
              </div>
              <button 
                onClick={() => setShowLevelModal(false)} 
                className="text-gray-400 hover:text-white p-2"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Two Column Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* LEFT COLUMN: Level Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <FaSchool /> School Information
                    </h4>
                    <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                      <p><span className="text-gray-400">School:</span> {selectedLevel.school_name}</p>
                      <p><span className="text-gray-400">Period:</span> {selectedLevel.start_year} - {selectedLevel.end_year}</p>
                      <p><span className="text-gray-400">Status:</span> 
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          selectedLevel.status === 'completed' ? 'bg-green-900 text-green-300' :
                          selectedLevel.status === 'building' ? 'bg-amber-900 text-amber-300' :
                          'bg-blue-900 text-blue-300'
                        }`}>
                          {selectedLevel.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  {selectedLevel.description && (
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 mb-2">Description</h4>
                      <p className="text-gray-300 leading-relaxed">{selectedLevel.description}</p>
                    </div>
                  )}

                  {/* Legacy Documents Summary */}
                  {(() => {
                    const docs = documents[selectedLevel.id] || []
                    const hasDocs = docs.length > 0
                    if (!hasDocs) return null
                    
                    return (
                      <div>
                        <h4 className="text-lg font-semibold text-blue-400 mb-2">Documents</h4>
                        <div className="flex flex-wrap gap-2">
                          {docs.filter(d => d.document_type === 'report').length > 0 && (
                            <button
                              onClick={() => {
                                setShowLevelModal(false)
                                openDocumentViewer(docs.filter(d => d.document_type === 'report'), 'Reports')
                              }}
                              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                            >
                              <FaFilePdf /> {docs.filter(d => d.document_type === 'report').length} Reports
                            </button>
                          )}
                          {docs.filter(d => d.document_type === 'certificate').length > 0 && (
                            <button
                              onClick={() => {
                                setShowLevelModal(false)
                                openDocumentViewer(docs.filter(d => d.document_type === 'certificate'), 'Certificates')
                              }}
                              className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                            >
                              <FaAward /> {docs.filter(d => d.document_type === 'certificate').length} Certs
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* RIGHT COLUMN: Reports & Photos */}
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                    <FaImages /> Reports & Photos
                  </h4>
                  
                  {(() => {
                    const levelReports = reports[selectedLevel.id] || []
                    
                    if (levelReports.length === 0) {
                      return (
                        <div className="bg-slate-700/30 rounded-lg p-8 text-center">
                          <FaImages className="text-gray-500 text-4xl mx-auto mb-3" />
                          <p className="text-gray-400">No reports or photos available for this level yet.</p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-4">
                        {/* Summary counts */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {levelReports.filter(r => r.report_type === 'school_report').length > 0 && (
                            <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs">
                              Reports: {levelReports.filter(r => r.report_type === 'school_report').length}
                            </span>
                          )}
                          {levelReports.filter(r => r.report_type === 'uniform_photo').length > 0 && (
                            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                              Uniform: {levelReports.filter(r => r.report_type === 'uniform_photo').length}
                            </span>
                          )}
                          {levelReports.filter(r => r.report_type === 'school_photo').length > 0 && (
                            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
                              Photos: {levelReports.filter(r => r.report_type === 'school_photo').length}
                            </span>
                          )}
                        </div>

                        {/* Reports Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {levelReports.map(report => (
                            <div 
                              key={report.id}
                              onClick={() => viewFile(report)}
                              className="bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition group"
                            >
                              {/* Thumbnail or Preview */}
                              <div className="aspect-square bg-slate-800 relative overflow-hidden">
                                {report.thumbnail_url ? (
                                  <img 
                                    src={report.thumbnail_url} 
                                    alt={report.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                  />
                                ) : report.file_url?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                  <img 
                                    src={report.file_url} 
                                    alt={report.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-5xl">{getReportTypeIcon(report.report_type)}</span>
                                  </div>
                                )}
                                
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <span className="text-white font-semibold flex items-center gap-2">
                                    <FaEye /> Click to View
                                  </span>
                                </div>
                                
                                {/* Type badge */}
                                <div className="absolute top-2 left-2">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    report.report_type === 'school_report' ? 'bg-red-600/80' :
                                    report.report_type === 'uniform_photo' ? 'bg-blue-600/80' :
                                    'bg-green-600/80'
                                  }`}>
                                    {getReportTypeLabel(report.report_type)}
                                  </span>
                                </div>
                                
                                {/* Featured badge */}
                                {report.is_featured && (
                                  <div className="absolute top-2 right-2">
                                    <span className="text-xs bg-amber-500 text-black px-2 py-1 rounded font-bold">
                                      ⭐ Featured
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Info */}
                              <div className="p-3">
                                <h5 className="font-medium text-sm truncate">{report.title}</h5>
                                {report.academic_year && (
                                  <p className="text-xs text-gray-400">{report.academic_year}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal (for reports/photos) */}
      {viewingFile && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4"
          onClick={() => setViewingFile(null)}
        >
          <button 
            onClick={() => setViewingFile(null)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition z-10"
          >
            <FaTimes />
          </button>
          <div 
            className="max-w-5xl max-h-[90vh] w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            {viewingFile.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img 
                src={viewingFile.file_url} 
                alt={viewingFile.title}
                className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
              />
            ) : viewingFile.file_url?.match(/\.pdf$/i) ? (
              <iframe 
                src={viewingFile.file_url} 
                className="w-full h-[80vh] rounded-lg"
                title={viewingFile.title}
              />
            ) : (
              <div className="bg-slate-800 rounded-lg p-8 text-center">
                <p className="text-xl mb-4">{getReportTypeIcon(viewingFile.report_type)}</p>
                <h3 className="text-xl font-bold mb-2">{viewingFile.title}</h3>
                <a 
                  href={viewingFile.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded inline-flex items-center gap-2"
                >
                  <FaDownload /> Download/View File
                </a>
              </div>
            )}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{viewingFile.title}</h3>
              <p className="text-gray-400">
                {getReportTypeLabel(viewingFile.report_type)}
                {viewingFile.academic_year && ` • ${viewingFile.academic_year}`}
              </p>
              {viewingFile.description && (
                <p className="text-gray-500 mt-2 max-w-xl mx-auto">{viewingFile.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Lightbox */}
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
            </div>
          </div>
        </div>
      )}

      {/* Document Modal (Legacy) */}
      {showDocModal && selectedDocs && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedDocs.type}</h3>
              <button onClick={() => setShowDocModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
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
                      {doc.is_premium && <FaLock className="text-amber-500" />}
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