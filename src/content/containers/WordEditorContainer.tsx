import { connect } from 'react-redux'
import WordEditorPortal from '../components/WordEditorPortal'
import { StoreState } from '../redux/modules'
import { closePanel, closeWordEditor } from '../redux/modules/widget'
import { saveWord, getWordsByText } from '@/_helpers/record-manager'
import { SelectionInfo } from '@/_helpers/selection'

export const mapStateToProps = ({ config, dictionaries, widget }: StoreState) => {
  return {
    shouldWordEditorShow: widget.shouldWordEditorShow,
    dictPanelWidth: config.panelWidth,
    info: dictionaries.searchHistory[0],
  }
}

export const mapDispatchToProps = {
  closeDictPanel: closePanel,
  closeModal: closeWordEditor,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WordEditorPortal)