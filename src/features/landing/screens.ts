// Real screens and recordings of the app, captured from the demo build (mock data only).
import darkDashboard from '../../assets/landing/dark-dashboard.jpg'
import darkLibrary from '../../assets/landing/dark-biblioteca.jpg'
import darkProcedures from '../../assets/landing/dark-procedimentos.jpg'
import darkNotices from '../../assets/landing/dark-avisos.jpg'
import darkRoles from '../../assets/landing/dark-cargos.jpg'
import lightDashboard from '../../assets/landing/light-dashboard.jpg'
import lightLibrary from '../../assets/landing/light-biblioteca.jpg'
import lightProcedures from '../../assets/landing/light-procedimentos.jpg'
import lightRoles from '../../assets/landing/light-cargos.jpg'
import tourVideo from '../../assets/landing/video/tour.webm'
import libraryVideo from '../../assets/landing/video/library.webm'
import procedureVideo from '../../assets/landing/video/procedure.webm'
import noticesVideo from '../../assets/landing/video/notices.webm'
import rolesVideo from '../../assets/landing/video/roles.webm'
import tourPoster from '../../assets/landing/video/poster-tour.jpg'
import libraryPoster from '../../assets/landing/video/poster-library.jpg'
import procedurePoster from '../../assets/landing/video/poster-procedure.jpg'
import noticesPoster from '../../assets/landing/video/poster-notices.jpg'
import rolesPoster from '../../assets/landing/video/poster-roles.jpg'

export const screens = {
  darkDashboard,
  darkLibrary,
  darkProcedures,
  darkNotices,
  darkRoles,
  lightDashboard,
  lightLibrary,
  lightProcedures,
  lightRoles,
}

export const videos = {
  tour: tourVideo,
  library: libraryVideo,
  procedure: procedureVideo,
  notices: noticesVideo,
  roles: rolesVideo,
}

// first frames of the recordings, at the same scale, shown until each video plays
export const posters = {
  tour: tourPoster,
  library: libraryPoster,
  procedure: procedurePoster,
  notices: noticesPoster,
  roles: rolesPoster,
}
