import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaRegCopy, FaDownload, FaTrash, FaEdit, FaExpandAlt, FaCompressAlt, FaRegLightbulb } from "react-icons/fa";
import { BsCodeSlash } from "react-icons/bs";
import languagesList from "../../utils/LanguageList";
import useSecurityCheck from "../../hooks/useSecurityCheck";
import makeToast from "../../utils/ToastUtils";
import { useRecoilValue } from "recoil";
import { colorThemeState } from "../../atoms";
import SystemThemes from '../../utils/SystemThemes';

// Define the shape of the snippet prop
const snippetPropType = PropTypes.shape({
    snippetLanguage: PropTypes.string.isRequired,
    snippetCode: PropTypes.string.isRequired,
    snippetFilename: PropTypes.string,
    mimeType: PropTypes.string
});

const SingleCodeItem = ({ snippet, editCodeFile, deleteCodeFile }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(
        languagesList.find(lang => lang.languageValue === snippet.snippetLanguage)
    );
    const [expanded, setExpanded] = useState(false);
    const [lineNumbers, setLineNumbers] = useState(true);
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const colorTheme = useRecoilValue(colorThemeState);
    
    const isSecure = useSecurityCheck();

    useEffect(() => {
        setSelectedLanguage(languagesList.find(lang => lang.languageValue === snippet.snippetLanguage));
    }, [snippet.snippetLanguage]);

    useEffect(() => {
        const themeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "dark";
        setIsDarkTheme(themeType === "dark");
    }, [colorTheme]);

    const handleCopy = () => {
        if (isSecure && navigator.clipboard) {
            navigator.clipboard.writeText(snippet.snippetCode).then(() => {
                makeToast('success', 'Copied to clipboard.');
            }).catch(err => {
                makeToast('error', `Failed to copy: ${err}`);
            });
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = snippet.snippetCode;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                makeToast('success', 'Copied to clipboard.');
            } catch (err) {
                makeToast('error', `Failed to copy: ${err}`);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([snippet.snippetCode], { type: snippet.mimeType || 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${snippet.snippetFilename || "Snippet"}${selectedLanguage?.languageExtension ? `.${selectedLanguage.languageExtension}` : ''}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const toggleLineNumbers = () => {
        setLineNumbers(!lineNumbers);
    };

    const estimatedLines = snippet.snippetCode.split('\n').length;

    return (
        <div className={`border ${expanded ? 'border-snippetSingleItemBorder' : 'border-snippetSingleItemBorder/0 hover:border-snippetSingleItemBorder/30'} transition-all duration-300 ${expanded ? 'z-9999 fixed inset-4 z-50 bg-snippetCardBg rounded-lg shadow-2xl flex flex-col' : ''}`}>
            <div className={`bg-snippetCardBg ${expanded ? 'border-b border-snippetSingleItemBorder' : ''}`}>
                <div className="flex justify-between items-center p-3">
                    <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-md bg-snippetSingleItemBorder bg-opacity-20">
                            <BsCodeSlash className="text-snippedIconColor" />
                        </div>
                        <div>
                            <div className="font-medium text-snippetCardText">
                                {snippet.snippetFilename || selectedLanguage?.languageName || "Snippet"}
                            </div>
                            <div className="text-xs text-snippedIconColor">
                                {estimatedLines} {estimatedLines === 1 ? 'line' : 'lines'} · {selectedLanguage?.languageName || "Text"}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex space-x-1">
                        <button
                            onClick={toggleLineNumbers}
                            className="p-2 rounded-md text-snippedIconColor hover:text-snippedIconHoverColor hover:bg-snippetSingleItemHoverBg transition-colors"
                            title={lineNumbers ? "Hide line numbers" : "Show line numbers"}
                        >
                            <FaRegLightbulb size={16} />
                        </button>
                        
                        {snippet.snippetLanguage !== "disptext" && (
                            <>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 rounded-md text-snippedIconColor hover:text-snippedIconHoverColor hover:bg-snippetSingleItemHoverBg transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <FaRegCopy size={16} />
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="p-2 rounded-md text-snippedIconColor hover:text-snippedIconHoverColor hover:bg-snippetSingleItemHoverBg transition-colors"
                                    title="Download file"
                                >
                                    <FaDownload size={16} />
                                </button>
                            </>
                        )}
                        
                        <button
                            onClick={editCodeFile}
                            className="p-2 rounded-md text-snippedIconColor hover:text-snippedIconHoverColor hover:bg-snippetSingleItemHoverBg transition-colors"
                            title="Edit snippet"
                        >
                            <FaEdit size={16} />
                        </button>
                        
                        <button
                            onClick={deleteCodeFile}
                            className="p-2 rounded-md text-snippedIconColor hover:text-snippedIconHoverColor hover:bg-snippetSingleItemHoverBg transition-colors"
                            title="Delete snippet"
                        >
                            <FaTrash size={16} />
                        </button>
                        
                        <button
                            onClick={toggleExpand}
                            className="p-2 rounded-md text-snippedIconColor hover:text-snippedIconHoverColor hover:bg-snippetSingleItemHoverBg transition-colors"
                            title={expanded ? "Exit fullscreen" : "View in fullscreen"}
                        >
                            {expanded ? <FaCompressAlt size={16} /> : <FaExpandAlt size={16} />}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className={`overflow-auto ${expanded ? 'flex-grow' : ''}`}>
                {snippet.snippetLanguage === "disptext" ? (
                    <div className="p-4 whitespace-pre-wrap font-mono text-sm text-snippetCardText">
                        {snippet.snippetCode}
                    </div>
                ) : (
                    <SyntaxHighlighter
                        style={isDarkTheme ? vscDarkPlus : vs}
                        language={selectedLanguage?.languageValue}
                        showLineNumbers={lineNumbers}
                        wrapLines
                        customStyle={{
                            margin: 0,
                            fontSize: '0.9rem',
                            borderRadius: 0,
                            background: isDarkTheme ? 'rgb(30, 30, 30)' : '#f8f8f8'
                        }}
                    >
                        {snippet.snippetCode}
                    </SyntaxHighlighter>
                )}
            </div>
        </div>
    );
};

SingleCodeItem.propTypes = {
    snippet: snippetPropType.isRequired,
    editCodeFile: PropTypes.func.isRequired,
    deleteCodeFile: PropTypes.func.isRequired
};

const MemoizedComponent = React.memo(SingleCodeItem);
export default MemoizedComponent;